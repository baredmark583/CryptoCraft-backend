import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsNumber,
  Min,
  Max,
  IsUUID,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ReviewAttachmentDto {
  @IsEnum(['image', 'video'])
  type: 'image' | 'video';

  @IsUrl()
  url: string;

  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsNumber()
  size?: number;
}

export class CreateReviewDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  text?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ReviewAttachmentDto)
  attachments?: ReviewAttachmentDto[];

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
