import { DataSource, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { CategoryFieldWithMeta, CategorySchema } from '../constants';
export declare class CategoriesService {
    private readonly categoryRepository;
    private dataSource;
    constructor(categoryRepository: Repository<Category>, dataSource: DataSource);
    create(createCategoryDto: CreateCategoryDto): Promise<Category>;
    findAll(): Promise<Category[]>;
    findOne(id: string): Promise<Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    batchCreate(categories: CategorySchema[]): Promise<void>;
    batchCreateSubcategories(categories: CategorySchema[], parentId: string): Promise<void>;
    getResolvedFieldsById(categoryId: string): Promise<CategoryFieldWithMeta[]>;
    getResolvedFieldsByName(categoryName: string): Promise<CategoryFieldWithMeta[]>;
    private normalizeFields;
    private slugify;
    private resolveFields;
}
