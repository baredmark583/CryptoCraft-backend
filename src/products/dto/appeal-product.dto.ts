import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AppealProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;
}
