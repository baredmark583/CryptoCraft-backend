import { IsEnum, IsArray, IsOptional, ValidateNested, IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import {
  DisputeMessage,
  DisputePriority,
  DisputeTier,
  DisputeAutoAction,
  DisputeResolutionTemplate,
  DisputeInternalNote,
} from '../entities/dispute.entity';

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

class DisputeResolutionTemplateDto {
  id: string;
  title: string;
  body: string;
  action: 'REFUND_BUYER' | 'RELEASE_FUNDS' | 'PARTIAL_REFUND';
}

class DisputeInternalNoteDto {
  id: string;
  authorId: string;
  authorName: string;
  note: string;
  createdAt: string;
}

export class UpdateDisputeDto {
  @IsEnum(['OPEN', 'UNDER_REVIEW', 'RESOLVED_BUYER', 'RESOLVED_SELLER'])
  @IsOptional()
  status?: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_BUYER' | 'RESOLVED_SELLER';

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DisputeMessageDto)
  messages?: DisputeMessage[];

  @IsEnum(['LOW', 'NORMAL', 'URGENT'])
  @IsOptional()
  priority?: DisputePriority;

  @IsEnum(['LEVEL1', 'LEVEL2', 'SUPERVISOR'])
  @IsOptional()
  assignedTier?: DisputeTier;

  @IsString()
  @IsOptional()
  assignedArbitratorId?: string;

  @IsDateString()
  @IsOptional()
  responseSlaDueAt?: string;

  @IsEnum(['NONE', 'AUTO_RELEASE', 'AUTO_REFUND', 'AUTO_ESCALATE'])
  @IsOptional()
  pendingAutoAction?: DisputeAutoAction;

  @IsDateString()
  @IsOptional()
  pendingAutoActionAt?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DisputeResolutionTemplateDto)
  resolutionTemplates?: DisputeResolutionTemplate[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DisputeInternalNoteDto)
  internalNotes?: DisputeInternalNote[];
}
