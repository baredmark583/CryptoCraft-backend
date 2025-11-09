import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EscrowNetwork } from '../entities/escrow-transaction.entity';

export class TonWebhookDto {
  @IsString()
  secret: string;

  @IsString()
  orderId: string;

  @IsString()
  transactionHash: string;

  @IsNumber()
  amount: number;

  @IsEnum(['TON'])
  network: EscrowNetwork;

  @IsEnum(['DEPOSIT_CONFIRMED', 'RELEASE_CONFIRMED', 'REFUND_CONFIRMED'])
  eventType: 'DEPOSIT_CONFIRMED' | 'RELEASE_CONFIRMED' | 'REFUND_CONFIRMED';

  @IsOptional()
  @IsString()
  payload?: string;
}
