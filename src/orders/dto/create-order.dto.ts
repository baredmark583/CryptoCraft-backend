import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  ValidateNested,
  IsNumber,
  IsString,
  IsNotEmpty,
  ValidateIf,
  Min,
} from 'class-validator';
import { ShippingAddress } from '../../users/entities/user.entity';

class CartItemDto {
  @IsObject()
  product: { id: string, seller: { id: string } };

  @IsNumber()
  quantity: number;

  @IsNumber()
  priceAtTimeOfAddition: number;

  @IsOptional()
  @IsObject()
  variant?: any; 

  @IsEnum(['RETAIL', 'WHOLESALE'])
  purchaseType: 'RETAIL' | 'WHOLESALE';
}

class FullShippingAddressDto implements ShippingAddress {
    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    postOffice: string;
    
    @IsString()
    @IsNotEmpty()
    recipientName: string;
    
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsOptional()
    cityRef?: string;

    @IsString()
    @IsOptional()
    warehouseRef?: string;
}

class MeetingDetailsDto {
  @IsString()
  @IsNotEmpty()
  scheduledAt: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  cartItems: CartItemDto[];

  @IsEnum(['ESCROW', 'DIRECT'])
  paymentMethod: 'ESCROW' | 'DIRECT';

  @ValidateIf((dto) => dto.checkoutMode !== 'DEPOSIT')
  @IsEnum(['NOVA_POSHTA', 'UKRPOSHTA', 'MEETUP'])
  @IsOptional()
  shippingMethod?: 'NOVA_POSHTA' | 'UKRPOSHTA' | 'MEETUP';
  
  @ValidateIf((dto) => dto.checkoutMode !== 'DEPOSIT')
  @IsObject()
  @ValidateNested()
  @Type(() => FullShippingAddressDto)
  @IsOptional()
  shippingAddress?: FullShippingAddressDto;
  
  @IsString()
  @IsOptional()
  transactionHash?: string;

  @IsEnum(['CART', 'DEPOSIT'])
  @IsOptional()
  checkoutMode?: 'CART' | 'DEPOSIT';

  @ValidateIf((dto) => dto.checkoutMode === 'DEPOSIT')
  @IsNumber()
  @Min(0.01)
  escrowDepositAmount?: number;

  @ValidateIf((dto) => dto.checkoutMode === 'DEPOSIT')
  @IsObject()
  @ValidateNested()
  @Type(() => MeetingDetailsDto)
  meetingDetails?: MeetingDetailsDto;
}
