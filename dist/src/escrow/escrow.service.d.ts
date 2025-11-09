import { Repository } from 'typeorm';
import { EscrowTransaction, EscrowType } from './entities/escrow-transaction.entity';
import { EscrowEvent } from './entities/escrow-event.entity';
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
export declare class EscrowService {
    private readonly escrowRepository;
    private readonly escrowEventRepository;
    private readonly orderRepository;
    private readonly configService;
    constructor(escrowRepository: Repository<EscrowTransaction>, escrowEventRepository: Repository<EscrowEvent>, orderRepository: Repository<Order>, configService: ConfigService);
    createForOrder(order: Order, options?: {
        escrowType?: EscrowType;
    }): Promise<EscrowTransaction>;
    findByOrder(orderId: string): Promise<EscrowTransaction>;
    markFunded(orderId: string, dto: FundEscrowDto, actor?: ActorContext): Promise<EscrowTransaction>;
    markReleased(orderId: string, dto: ReleaseEscrowDto, actor: ActorContext): Promise<EscrowTransaction>;
    markRefunded(orderId: string, dto: RefundEscrowDto, actor: ActorContext): Promise<EscrowTransaction>;
    handleTonWebhook(dto: TonWebhookDto): Promise<{
        success: boolean;
    }>;
    private getEscrowOrFail;
    private logStatusChange;
    private logEvent;
    private ensurePrivilegedActor;
}
export {};
