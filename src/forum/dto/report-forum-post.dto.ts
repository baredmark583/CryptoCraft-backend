import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ReportForumPostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(280)
  reason: string;
}
