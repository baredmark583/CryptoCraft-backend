import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ReportWorkshopContentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(280)
  reason: string;
}
