import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export class FindProductsQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['priceAsc', 'priceDesc', 'rating', 'newest'])
  sortBy?: 'priceAsc' | 'priceDesc' | 'rating' | 'newest';

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : parseFloat(value)))
  @IsNumber()
  priceMin?: number;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : parseFloat(value)))
  @IsNumber()
  priceMax?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    try {
      if (typeof value === 'object') {
        return value;
      }
      return JSON.parse(value);
    } catch (error) {
      throw new BadRequestException('dynamicFilters must be a valid JSON object');
    }
  })
  dynamicFilters?: Record<string, string | number | (string | number)[]>;
}
