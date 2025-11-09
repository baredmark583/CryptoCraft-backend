import { CategorySchema } from '../../constants';
import { CategoryFieldDto } from './create-category.dto';
declare class CategoryStructureDto implements Omit<CategorySchema, 'subcategories' | 'fields'> {
    name: string;
    fields: CategoryFieldDto[];
    iconUrl?: string;
    subcategories?: CategoryStructureDto[];
}
export declare class BatchCreateCategoriesDto {
    categories: CategoryStructureDto[];
}
export {};
