import { IsEnum, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DisputeMessage } from '../entities/dispute.entity';

// Добавляем DTO для сообщений, чтобы обеспечить вложенную валидацию
class DisputeMessageDto {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    timestamp: number;
    text?: string;
    imageUrl?: string;
}

export class UpdateDisputeDto {
  @IsEnum(['OPEN', 'UNDER_REVIEW', 'RESOLVED_BUYER', 'RESOLVED_SELLER'])
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_BUYER' | 'RESOLVED_SELLER';

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DisputeMessageDto)
  messages?: DisputeMessage[];
}
