import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RefundEscrowDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  refundTransactionHash?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
