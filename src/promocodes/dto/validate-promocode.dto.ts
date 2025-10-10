import { IsArray, IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Simplified representation of CartItem from the frontend
class CartItemValidationDto {
    product: {
        id: string;
        seller: { id: string; };
        category: string;
    };
    quantity: number;
    priceAtTimeOfAddition: number;
}


export class ValidatePromoCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsUUID()
  @IsNotEmpty()
  sellerId: string;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemValidationDto)
  items: CartItemValidationDto[];
}