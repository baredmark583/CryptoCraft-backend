import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ModerateWorkshopContentDto {
  @IsEnum(['APPROVE', 'HIDE', 'DELETE', 'LOCK_COMMENTS', 'UNLOCK_COMMENTS'])
  action: 'APPROVE' | 'HIDE' | 'DELETE' | 'LOCK_COMMENTS' | 'UNLOCK_COMMENTS';

  @IsOptional()
  @IsString()
  @MaxLength(280)
  notes?: string;
}
