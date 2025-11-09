import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateThreadModerationDto {
  @IsEnum(['OPEN', 'LOCKED'])
  status: 'OPEN' | 'LOCKED';

  @IsOptional()
  @IsString()
  note?: string;
}
