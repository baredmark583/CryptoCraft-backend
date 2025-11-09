import { EscrowNetwork } from '../entities/escrow-transaction.entity';
export declare class TonWebhookDto {
    secret: string;
    orderId: string;
    transactionHash: string;
    amount: number;
    network: EscrowNetwork;
    eventType: 'DEPOSIT_CONFIRMED' | 'RELEASE_CONFIRMED' | 'REFUND_CONFIRMED';
    payload?: string;
}
