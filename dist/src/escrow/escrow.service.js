"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const escrow_transaction_entity_1 = require("./entities/escrow-transaction.entity");
const escrow_event_entity_1 = require("./entities/escrow-event.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const config_1 = require("@nestjs/config");
let EscrowService = class EscrowService {
    constructor(escrowRepository, escrowEventRepository, orderRepository, configService) {
        this.escrowRepository = escrowRepository;
        this.escrowEventRepository = escrowEventRepository;
        this.orderRepository = orderRepository;
        this.configService = configService;
    }
    async createForOrder(order, options) {
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
    async findByOrder(orderId) {
        return this.escrowRepository.findOne({
            where: { order: { id: orderId } },
            relations: ['events'],
            order: { events: { createdAt: 'DESC' } },
        });
    }
    async markFunded(orderId, dto, actor) {
        this.ensurePrivilegedActor(actor);
        const escrow = await this.getEscrowOrFail(orderId);
        if (!['AWAITING_PAYMENT', 'PENDING_CONFIRMATION'].includes(escrow.status)) {
            throw new common_1.BadRequestException('Escrow already funded or not awaiting payment');
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
        await this.logEvent(escrow, 'PAYMENT_DETECTED', dto.note ?? 'Deposit confirmed', {
            transactionHash: dto.transactionHash,
            network: dto.network,
        }, actor);
        await this.logStatusChange(escrow, 'FUNDED', actor);
        return escrow;
    }
    async markReleased(orderId, dto, actor) {
        this.ensurePrivilegedActor(actor);
        const escrow = await this.getEscrowOrFail(orderId);
        if (!['FUNDED', 'DISPUTED'].includes(escrow.status)) {
            throw new common_1.BadRequestException('Escrow must be funded before release');
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
    async markRefunded(orderId, dto, actor) {
        this.ensurePrivilegedActor(actor);
        const escrow = await this.getEscrowOrFail(orderId);
        if (!['FUNDED', 'DISPUTED'].includes(escrow.status)) {
            throw new common_1.BadRequestException('Only funded or disputed escrows can be refunded');
        }
        const targetStatus = dto.amount && dto.amount < escrow.amount ? 'PARTIALLY_REFUNDED' : 'REFUNDED';
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
    async handleTonWebhook(dto) {
        const expectedSecret = this.configService.get('TON_WEBHOOK_SECRET');
        if (!expectedSecret || expectedSecret !== dto.secret) {
            throw new common_1.UnauthorizedException('Invalid webhook secret');
        }
        if (dto.eventType === 'DEPOSIT_CONFIRMED') {
            await this.markFunded(dto.orderId, { transactionHash: dto.transactionHash, network: dto.network }, { role: 'SYSTEM' });
        }
        else if (dto.eventType === 'RELEASE_CONFIRMED') {
            const escrow = await this.getEscrowOrFail(dto.orderId);
            escrow.releaseTransactionHash = dto.transactionHash;
            await this.escrowRepository.save(escrow);
            await this.logEvent(escrow, 'WEBHOOK', 'Release transaction confirmed on-chain', { transactionHash: dto.transactionHash, amount: dto.amount }, { role: 'SYSTEM' });
        }
        else if (dto.eventType === 'REFUND_CONFIRMED') {
            const escrow = await this.getEscrowOrFail(dto.orderId);
            escrow.refundTransactionHash = dto.transactionHash;
            await this.escrowRepository.save(escrow);
            await this.logEvent(escrow, 'WEBHOOK', 'Refund transaction confirmed on-chain', { transactionHash: dto.transactionHash, amount: dto.amount }, { role: 'SYSTEM' });
        }
        return { success: true };
    }
    async getEscrowOrFail(orderId) {
        const escrow = await this.escrowRepository.findOne({
            where: { order: { id: orderId } },
            relations: ['order'],
        });
        if (!escrow) {
            throw new common_1.NotFoundException(`Escrow transaction for order ${orderId} not found`);
        }
        return escrow;
    }
    async logStatusChange(escrow, status, actor, description, payload) {
        await this.logEvent(escrow, 'STATUS_CHANGE', description ?? `Escrow status changed to ${status}`, payload, actor);
    }
    async logEvent(escrow, type, description, payload, actor) {
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
    ensurePrivilegedActor(actor) {
        if (!actor) {
            throw new common_1.UnauthorizedException('Недостаточно прав для управления эскроу.');
        }
        const role = actor.role ?? 'USER';
        if (!['ADMIN', 'SYSTEM'].includes(role)) {
            throw new common_1.UnauthorizedException('Недостаточно прав для управления эскроу.');
        }
    }
};
exports.EscrowService = EscrowService;
exports.EscrowService = EscrowService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(escrow_transaction_entity_1.EscrowTransaction)),
    __param(1, (0, typeorm_1.InjectRepository)(escrow_event_entity_1.EscrowEvent)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], EscrowService);
//# sourceMappingURL=escrow.service.js.map