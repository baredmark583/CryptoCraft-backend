import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';

export class CreatePromoCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(['PERCENTAGE', 'FIXED_AMOUNT'])
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  
  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxUses?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchaseAmount?: number;

  @IsEnum(['ENTIRE_ORDER', 'CATEGORY'])
  scope: 'ENTIRE_ORDER' | 'CATEGORY';

  @IsOptional()
  @IsString()
  applicableCategory?: string;

  @IsOptional()
  @IsNumber()
  validUntil?: number;
}