import { BaseEntity } from '../../database/base.entity';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { EscrowEvent } from './escrow-event.entity';
export type EscrowStatus = 'AWAITING_PAYMENT' | 'PENDING_CONFIRMATION' | 'FUNDED' | 'RELEASED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'CANCELLED' | 'DISPUTED';
export type EscrowNetwork = 'TON';
export type EscrowCurrency = 'USDT';
export type EscrowType = 'CART' | 'DEPOSIT';
export declare class EscrowTransaction extends BaseEntity {
    order: Order;
    buyer: User | null;
    seller: User | null;
    amount: number;
    currency: EscrowCurrency;
    network: EscrowNetwork;
    status: EscrowStatus;
    escrowType: EscrowType;
    depositTransactionHash?: string;
    releaseTransactionHash?: string;
    refundTransactionHash?: string;
    metadata: Record<string, any>;
    events: EscrowEvent[];
}
