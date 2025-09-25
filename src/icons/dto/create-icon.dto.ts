import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateIconDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  svgContent?: string;

  @IsUrl()
  @IsOptional()
  iconUrl?: string;
}
