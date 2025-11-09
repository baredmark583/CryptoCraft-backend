import { EscrowService } from './escrow.service';
import { FundEscrowDto } from './dto/fund-escrow.dto';
import { ReleaseEscrowDto } from './dto/release-escrow.dto';
import { RefundEscrowDto } from './dto/refund-escrow.dto';
import { TonWebhookDto } from './dto/ton-webhook.dto';
export declare class EscrowController {
    private readonly escrowService;
    constructor(escrowService: EscrowService);
    getByOrder(orderId: string): Promise<import("./entities/escrow-transaction.entity").EscrowTransaction>;
    markFunded(orderId: string, dto: FundEscrowDto, req: any): Promise<import("./entities/escrow-transaction.entity").EscrowTransaction>;
    releaseFunds(orderId: string, dto: ReleaseEscrowDto, req: any): Promise<import("./entities/escrow-transaction.entity").EscrowTransaction>;
    refund(orderId: string, dto: RefundEscrowDto, req: any): Promise<import("./entities/escrow-transaction.entity").EscrowTransaction>;
    handleTonWebhook(dto: TonWebhookDto): Promise<{
        success: boolean;
    }>;
}
