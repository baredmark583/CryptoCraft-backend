import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateWorkshopPostDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}