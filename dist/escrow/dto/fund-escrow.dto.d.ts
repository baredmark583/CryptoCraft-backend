import { EscrowNetwork } from '../entities/escrow-transaction.entity';
export declare class FundEscrowDto {
    transactionHash: string;
    network: EscrowNetwork;
    note?: string;
}
