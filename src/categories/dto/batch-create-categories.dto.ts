import { Type } from 'class-transformer';
import { IsArray, ValidateNested, IsString, IsOptional } from 'class-validator';
import { CategorySchema } from '../../constants';
import { CategoryFieldDto } from './create-category.dto';

class CategoryStructureDto implements Omit<CategorySchema, 'subcategories' | 'fields'> {
    @IsString()
    name: string;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CategoryFieldDto)
    fields: CategoryFieldDto[];

    @IsString()
    @IsOptional()
    iconUrl?: string;

    // This is the key part for recursion
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CategoryStructureDto)
    subcategories?: CategoryStructureDto[];
}


export class BatchCreateCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryStructureDto)
  categories: CategoryStructureDto[];
}