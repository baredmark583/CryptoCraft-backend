import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateGlobalPromoCodeDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toUpperCase())
  code: string;

  @IsIn(['PERCENTAGE', 'FIXED_AMOUNT'])
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxUses?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPurchaseAmount?: number;

  @IsOptional()
  @IsString()
  @ValidateIf(({ validFrom }) => !!validFrom)
  validFrom?: string;

  @IsOptional()
  @IsString()
  @ValidateIf(({ validUntil }) => !!validUntil)
  validUntil?: string;
}
