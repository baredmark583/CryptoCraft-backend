import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EscrowNetwork } from '../entities/escrow-transaction.entity';

export class FundEscrowDto {
  @IsString()
  transactionHash: string;

  @IsEnum(['TON'])
  network: EscrowNetwork;

  @IsOptional()
  @IsString()
  note?: string;
}
