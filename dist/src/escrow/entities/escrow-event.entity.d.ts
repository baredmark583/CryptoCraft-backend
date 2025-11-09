import { BaseEntity } from '../../database/base.entity';
import { EscrowTransaction } from './escrow-transaction.entity';
export type EscrowEventType = 'STATUS_CHANGE' | 'PAYMENT_DETECTED' | 'WEBHOOK' | 'MANUAL_ACTION' | 'NOTE';
export declare class EscrowEvent extends BaseEntity {
    escrow: EscrowTransaction;
    type: EscrowEventType;
    description?: string;
    payload?: Record<string, any>;
    performedByUserId?: string;
    performedByRole?: 'USER' | 'SELLER' | 'ADMIN' | 'SYSTEM';
}
