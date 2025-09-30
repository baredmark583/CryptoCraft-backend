import { IsObject, IsOptional, IsString, IsUrl, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ProductContextDto {
    @IsUUID()
    id: string;
}

export class CreateMessageDto {
  @IsString()
  @IsOptional()
  text?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ProductContextDto)
  productContext?: ProductContextDto;
}
