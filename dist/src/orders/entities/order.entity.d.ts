import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { ShippingAddress } from '../../users/entities/user.entity';
import { Dispute } from '../../disputes/entities/dispute.entity';
import { EscrowTransaction } from '../../escrow/entities/escrow-transaction.entity';
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'DISPUTED' | 'COMPLETED' | 'CANCELLED';
export type CheckoutMode = 'CART' | 'DEPOSIT';
export declare class Order extends BaseEntity {
    buyer: User;
    seller: User;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    orderDate: number;
    shippingAddress?: ShippingAddress;
    shippingMethod: 'NOVA_POSHTA' | 'UKRPOSHTA' | 'MEETUP';
    paymentMethod: 'ESCROW' | 'DIRECT';
    trackingNumber?: string;
    transactionHash?: string;
    dispute?: Dispute;
    checkoutMode: CheckoutMode;
    depositAmount?: number;
    meetingDetails?: {
        scheduledAt?: string;
        location?: string;
        notes?: string;
    };
    escrow?: EscrowTransaction;
}
