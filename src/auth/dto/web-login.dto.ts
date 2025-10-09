import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class WebLoginDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  photo_url?: string;

  @IsNumber()
  auth_date: number;

  @IsString()
  @IsNotEmpty()
  hash: string;
}
