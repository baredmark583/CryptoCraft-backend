import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsUUID } from 'class-validator';

export class CreateLivestreamDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUUID()
  @IsNotEmpty()
  featuredProductId: string;

  @IsOptional()
  @IsNumber()
  scheduledStartTime?: number;

  @IsOptional()
  @IsUUID()
  moderatorId?: string;

  @IsOptional()
  @IsBoolean()
  isAiModeratorEnabled?: boolean;

  @IsOptional()
  @IsString()
  welcomeMessage?: string;
}
