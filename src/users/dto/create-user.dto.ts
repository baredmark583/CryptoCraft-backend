import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUrl, IsArray, IsObject, IsEnum, IsEmail } from 'class-validator';
import { ShippingAddress, BusinessInfo } from '../entities/user.entity';

export class CreateUserDto {
  @IsNumber()
  @IsOptional()
  telegramId: number;

  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @IsUrl()
  @IsOptional()
  headerImageUrl?: string;
  
  @IsNumber()
  @IsOptional()
  rating?: number;
  
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

  @IsString()
  @IsOptional()
  phoneNumber?: string;
  
  @IsObject()
  @IsOptional()
  defaultShippingAddress?: ShippingAddress;
  
  @IsObject()
  @IsOptional()
  businessInfo?: BusinessInfo;

  @IsString()
  @IsOptional()
  tonWalletAddress?: string;

  @IsString()
  @IsOptional()
  paymentCard?: string;
}