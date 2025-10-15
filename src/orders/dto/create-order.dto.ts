import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsObject, IsOptional, ValidateNested, IsNumber, IsString, IsNotEmpty } from 'class-validator';
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


export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  cartItems: CartItemDto[];

  @IsEnum(['ESCROW', 'DIRECT'])
  paymentMethod: 'ESCROW' | 'DIRECT';

  @IsEnum(['NOVA_POSHTA', 'UKRPOSHTA'])
  shippingMethod: 'NOVA_POSHTA' | 'UKRPOSHTA';
  
  @IsObject()
  @ValidateNested()
  @Type(() => FullShippingAddressDto)
  shippingAddress: FullShippingAddressDto;
  
  @IsString()
  @IsOptional()
  transactionHash?: string;
}
