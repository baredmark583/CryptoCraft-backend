import { IsUUID, IsNotEmpty } from 'class-validator';

export class AddProductDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;
}