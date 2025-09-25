import { IsNotEmpty, IsString } from 'class-validator';

export class CreateIconDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  svgContent: string;
}