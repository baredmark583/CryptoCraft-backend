import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApproveProductDto } from './approve-product.dto';

export class RejectProductDto extends ApproveProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
