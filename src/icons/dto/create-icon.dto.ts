import { IsNotEmpty, IsString, IsOptional, IsUrl, IsNumber, Min, Max } from 'class-validator';

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

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(512)
  width?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(512)
  height?: number;
}