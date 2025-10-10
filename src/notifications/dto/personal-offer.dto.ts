import { IsUUID, IsNotEmpty } from 'class-validator';

export class PersonalOfferDto {
  @IsUUID()
  @IsNotEmpty()
  recipientId: string;

  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsUUID()
  @IsNotEmpty()
  promoId: string;
}