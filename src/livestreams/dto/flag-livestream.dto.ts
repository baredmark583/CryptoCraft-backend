import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class FlagLivestreamDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(280)
  reason: string;
}
