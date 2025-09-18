import { IsString, IsNotEmpty, IsUrl, IsOptional, IsNumber, Min, Max, IsEnum, IsArray, IsObject, ValidateNested, IsPhoneNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { VerificationLevel, BusinessInfo, ShippingAddress } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  avatarUrl: string;

  @IsUrl()
  @IsOptional()
  headerImageUrl?: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsEnum(['NONE', 'PRO'])
  @IsOptional()
  verificationLevel?: VerificationLevel;

  @IsObject()
  @IsOptional()
  // @ValidateNested() // Раскомментировать, если создать DTO для BusinessInfo
  // @Type(() => BusinessInfoDto)
  businessInfo?: BusinessInfo;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  following?: string[];
  
  @IsNumber()
  @IsOptional()
  balance?: number;
  
  @IsNumber()
  @IsOptional()
  commissionOwed?: number;

  @IsString()
  @IsOptional()
  affiliateId?: string;

  @IsObject()
  @IsOptional()
  // @ValidateNested() // Раскомментировать, если создать DTO для ShippingAddress
  // @Type(() => ShippingAddressDto)
  defaultShippingAddress?: ShippingAddress;
  
  @IsPhoneNumber('UA') // Пример валидации для Украины
  @IsOptional()
  phoneNumber?: string;
}
