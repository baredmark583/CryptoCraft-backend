import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  EscrowTransaction,
  EscrowStatus,
  EscrowType,
} from './entities/escrow-transaction.entity';
import { EscrowEvent, EscrowEventType } from './entities/escrow-event.entity';
import { Order } from '../orders/entities/order.entity';
import { ReleaseEscrowDto } from './dto/release-escrow.dto';
import { RefundEscrowDto } from './dto/refund-escrow.dto';
import { FundEscrowDto } from './dto/fund-escrow.dto';
import { TonWebhookDto } from './dto/ton-webhook.dto';
import { ConfigService } from '@nestjs/config';

interface ActorContext {
  userId?: string;
  role?: 'USER' | 'SELLER' | 'ADMIN' | 'SYSTEM';
}

@Injectable()
export class EscrowService {
  constructor(
    @InjectRepository(EscrowTransaction)
    private readonly escrowRepository: Repository<EscrowTransaction>,
    @InjectRepository(EscrowEvent)
    private readonly escrowEventRepository: Repository<EscrowEvent>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly configService: ConfigService,
  ) {}

  async createForOrder(order: Order, options?: { escrowType?: EscrowType }) {
    if (order.paymentMethod !== 'ESCROW') {
      return null;
    }
    const existing = await this.escrowRepository.findOne({
      where: { order: { id: order.id } },
    });
    if (existing) {
      return existing;
    }
    const escrow = this.escrowRepository.create({
      order,
      buyer: order.buyer,
      seller: order.seller,
      amount: order.depositAmount ?? order.total,
      network: 'TON',
      currency: 'USDT',
      escrowType: options?.escrowType ?? (order.checkoutMode === 'DEPOSIT' ? 'DEPOSIT' : 'CART'),
      status: 'AWAITING_PAYMENT',
      metadata: {
        checkoutMode: order.checkoutMode,
        meetingDetails: order.meetingDetails,
      },
    });
    const saved = await this.escrowRepository.save(escrow);
    await this.logEvent(saved, 'STATUS_CHANGE', 'Escrow created');
    return saved;
  }

  async findByOrder(orderId: string) {
    return this.escrowRepository.findOne({
      where: { order: { id: orderId } },
      relations: ['events'],
      order: { events: { createdAt: 'DESC' } },
    });
  }

  async markFunded(orderId: string, dto: FundEscrowDto, actor?: ActorContext) {
    this.ensurePrivilegedActor(actor);
    const escrow = await this.getEscrowOrFail(orderId);
    if (!['AWAITING_PAYMENT', 'PENDING_CONFIRMATION'].includes(escrow.status)) {
      throw new BadRequestException('Escrow already funded or not awaiting payment');
    }
    escrow.status = 'FUNDED';
    escrow.depositTransactionHash = dto.transactionHash;
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (order) {
      order.status = 'PAID';
      await this.orderRepository.save(order);
    }
    await this.escrowRepository.save(escrow);
    await this.logEvent(
      escrow,
      'PAYMENT_DETECTED',
      dto.note ?? 'Deposit confirmed',
      {
        transactionHash: dto.transactionHash,
        network: dto.network,
      },
      actor,
    );
    await this.logStatusChange(escrow, 'FUNDED', actor);
    return escrow;
  }

  async markReleased(orderId: string, dto: ReleaseEscrowDto, actor: ActorContext) {
    this.ensurePrivilegedActor(actor);
    const escrow = await this.getEscrowOrFail(orderId);
    if (!['FUNDED', 'DISPUTED'].includes(escrow.status)) {
      throw new BadRequestException('Escrow must be funded before release');
    }
    escrow.status = 'RELEASED';
    escrow.releaseTransactionHash = dto.releaseTransactionHash;
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (order) {
      order.status = 'COMPLETED';
      await this.orderRepository.save(order);
    }
    await this.escrowRepository.save(escrow);
    await this.logStatusChange(escrow, 'RELEASED', actor, dto.note);
    return escrow;
  }

  async markRefunded(orderId: string, dto: RefundEscrowDto, actor: ActorContext) {
    this.ensurePrivilegedActor(actor);
    const escrow = await this.getEscrowOrFail(orderId);
    if (!['FUNDED', 'DISPUTED'].includes(escrow.status)) {
      throw new BadRequestException('Only funded or disputed escrows can be refunded');
    }
    const targetStatus: EscrowStatus =
      dto.amount && dto.amount < escrow.amount ? 'PARTIALLY_REFUNDED' : 'REFUNDED';
    escrow.status = targetStatus;
    escrow.refundTransactionHash = dto.refundTransactionHash;
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (order) {
      order.status = 'CANCELLED';
      await this.orderRepository.save(order);
    }
    await this.escrowRepository.save(escrow);
    await this.logStatusChange(escrow, targetStatus, actor, dto.note, {
      amount: dto.amount ?? escrow.amount,
    });
    return escrow;
  }

  async handleTonWebhook(dto: TonWebhookDto) {
    const expectedSecret = this.configService.get<string>('TON_WEBHOOK_SECRET');
    if (!expectedSecret || expectedSecret !== dto.secret) {
      throw new UnauthorizedException('Invalid webhook secret');
    }

    if (dto.eventType === 'DEPOSIT_CONFIRMED') {
      await this.markFunded(dto.orderId, { transactionHash: dto.transactionHash, network: dto.network }, { role: 'SYSTEM' });
    } else if (dto.eventType === 'RELEASE_CONFIRMED') {
      const escrow = await this.getEscrowOrFail(dto.orderId);
      escrow.releaseTransactionHash = dto.transactionHash;
      await this.escrowRepository.save(escrow);
      await this.logEvent(
        escrow,
        'WEBHOOK',
        'Release transaction confirmed on-chain',
        { transactionHash: dto.transactionHash, amount: dto.amount },
        { role: 'SYSTEM' },
      );
    } else if (dto.eventType === 'REFUND_CONFIRMED') {
      const escrow = await this.getEscrowOrFail(dto.orderId);
      escrow.refundTransactionHash = dto.transactionHash;
      await this.escrowRepository.save(escrow);
      await this.logEvent(
        escrow,
        'WEBHOOK',
        'Refund transaction confirmed on-chain',
        { transactionHash: dto.transactionHash, amount: dto.amount },
        { role: 'SYSTEM' },
      );
    }
    return { success: true };
  }

  private async getEscrowOrFail(orderId: string) {
    const escrow = await this.escrowRepository.findOne({
      where: { order: { id: orderId } },
      relations: ['order'],
    });
    if (!escrow) {
      throw new NotFoundException(`Escrow transaction for order ${orderId} not found`);
    }
    return escrow;
  }

  private async logStatusChange(
    escrow: EscrowTransaction,
    status: EscrowStatus,
    actor?: ActorContext,
    description?: string,
    payload?: Record<string, any>,
  ) {
    await this.logEvent(
      escrow,
      'STATUS_CHANGE',
      description ?? `Escrow status changed to ${status}`,
      payload,
      actor,
    );
  }

  private async logEvent(
    escrow: EscrowTransaction,
    type: EscrowEventType,
    description?: string,
    payload?: Record<string, any>,
    actor?: ActorContext,
  ) {
    const event = this.escrowEventRepository.create({
      escrow,
      type,
      description,
      payload,
      performedByUserId: actor?.userId,
      performedByRole: actor?.role ?? 'SYSTEM',
    });
    await this.escrowEventRepository.save(event);
  }

  private ensurePrivilegedActor(actor?: ActorContext) {
    if (!actor) {
      throw new UnauthorizedException('Недостаточно прав для управления эскроу.');
    }
    const role = actor.role ?? 'USER';
    if (!['ADMIN', 'SYSTEM'].includes(role)) {
      throw new UnauthorizedException('Недостаточно прав для управления эскроу.');
    }
  }
}
