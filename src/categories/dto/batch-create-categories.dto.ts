import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CategorySchema } from '../../admin/constants';

// We can't use CreateCategoryDto directly because of recursion issues with decorators.
// A simpler class or interface is better for validation here. We will trust the AI's structure.
class CategoryStructureDto implements CategorySchema {
    name: string;
    fields: any[];
    iconUrl?: string;
    subcategories?: CategoryStructureDto[];
}


export class BatchCreateCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryStructureDto)
  categories: CategoryStructureDto[];
}
