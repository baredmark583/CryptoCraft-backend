import { IsString, IsNotEmpty, IsOptional, IsUrl, IsNumber, Min, Max, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  text: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}