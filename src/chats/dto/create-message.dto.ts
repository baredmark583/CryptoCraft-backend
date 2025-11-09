import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ProductContextDto {
    @IsUUID()
    id: string;
}

class AttachmentDto {
  @IsString()
  id: string;

  @IsEnum(['image', 'file'])
  type: 'image' | 'file';

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;
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

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  quickReplies?: string[];
}
