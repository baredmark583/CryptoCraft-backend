import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
