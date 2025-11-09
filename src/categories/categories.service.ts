import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { CategoryFieldWithMeta, CategorySchema } from '../constants';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private dataSource: DataSource,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    const normalizedDto = {
      ...createCategoryDto,
      fields: this.normalizeFields(createCategoryDto.fields ?? []),
    };
    const category = this.categoryRepository.create(normalizedDto);
    return this.categoryRepository.save(category);
  }

  async findAll() {
    const allCategories = await this.categoryRepository.find({
      order: { name: 'ASC' },
    });

    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // Initialize map and subcategories array for each category
    allCategories.forEach(category => {
        category.subcategories = [];
        categoryMap.set(category.id, category);
    });

    // Build the tree structure
    allCategories.forEach(category => {
        if (category.parentId && categoryMap.has(category.parentId)) {
            const parent = categoryMap.get(category.parentId);
            parent.subcategories.push(category);
        } else {
            rootCategories.push(category);
        }
    });

    const enrich = (category: Category): Category => {
      const resolvedFields = this.resolveFields(category, categoryMap);
      (category as Category & { resolvedFields: CategoryFieldWithMeta[] }).resolvedFields = resolvedFields;
      if (category.subcategories) {
        category.subcategories = category.subcategories.map((child) => enrich(child));
      }
      return category;
    };

    return rootCategories.map((root) => enrich(root));
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['subcategories'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    // FIX: Create a mutable copy of the DTO with an explicit type to handle fields safely.
    // This also helps TypeScript resolve the type of the 'fields' property.
    const updatePayload: Partial<Category> = {
      ...updateCategoryDto,
      fields: updateCategoryDto.fields
        ? this.normalizeFields(updateCategoryDto.fields)
        : undefined,
    };

    // We need to clean up the fields array, removing temporary IDs
    if (updatePayload.fields) {
      updatePayload.fields.forEach(field => {
        if ((field as any).id && (field as any).id.startsWith('new_')) {
          delete (field as any).id;
        }
      });
    }

    const category = await this.categoryRepository.preload({ id, ...updatePayload });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return this.categoryRepository.save(category);
  }

  async remove(id: string) {
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return { success: true };
  }

  async batchCreate(categories: CategorySchema[]): Promise<void> {
    await this.dataSource.transaction(async manager => {
        // Clear all existing categories for a fresh start
        await manager.query('TRUNCATE TABLE "categories" RESTART IDENTITY CASCADE');

        const saveCategoriesRecursive = async (
            categoriesToSave: CategorySchema[],
            parentId: string | null,
        ): Promise<void> => {
            for (const categoryData of categoriesToSave) {
                const newCategory = manager.create(Category, {
                    name: categoryData.name,
                    iconUrl: categoryData.iconUrl,
                    fields: this.normalizeFields(categoryData.fields || []),
                    parentId: parentId,
                });
                const savedCategory = await manager.save(newCategory);

                if (categoryData.subcategories && categoryData.subcategories.length > 0) {
                    await saveCategoriesRecursive(categoryData.subcategories, savedCategory.id);
                }
            }
        };

        await saveCategoriesRecursive(categories, null);
    });
  }
  
  async batchCreateSubcategories(categories: CategorySchema[], parentId: string): Promise<void> {
    const parentCategory = await this.categoryRepository.findOneBy({ id: parentId });
    if (!parentCategory) {
        throw new NotFoundException(`Parent category with ID ${parentId} not found.`);
    }

    await this.dataSource.transaction(async manager => {
        const saveCategoriesRecursive = async (
            categoriesToSave: CategorySchema[],
            currentParentId: string | null,
        ): Promise<void> => {
            for (const categoryData of categoriesToSave) {
                const newCategory = manager.create(Category, {
                    name: categoryData.name,
                    iconUrl: categoryData.iconUrl,
                    fields: this.normalizeFields(categoryData.fields || []),
                    parentId: currentParentId,
                });
                const savedCategory = await manager.save(newCategory);

                if (categoryData.subcategories && categoryData.subcategories.length > 0) {
                    await saveCategoriesRecursive(categoryData.subcategories, savedCategory.id);
                }
            }
        };

        // Clear existing subcategories before adding new ones
        await manager.delete(Category, { parentId });

        // Start recursion with the provided parentId
        await saveCategoriesRecursive(categories, parentId);
    });
  }

  async getResolvedFieldsById(categoryId: string): Promise<CategoryFieldWithMeta[]> {
    const allCategories = await this.categoryRepository.find();
    const category = allCategories.find((cat) => cat.id === categoryId);
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found.`);
    }
    const map = new Map(allCategories.map((cat) => [cat.id, cat]));
    return this.resolveFields(category, map);
  }

  async getResolvedFieldsByName(categoryName: string): Promise<CategoryFieldWithMeta[]> {
    const allCategories = await this.categoryRepository.find();
    const category = allCategories.find((cat) => cat.name === categoryName);
    if (!category) {
      throw new NotFoundException(`Category with name "${categoryName}" not found.`);
    }
    const map = new Map(allCategories.map((cat) => [cat.id, cat]));
    return this.resolveFields(category, map);
  }

  private normalizeFields(fields: Category['fields']): Category['fields'] {
    if (!fields) return [];
    return fields.map((field) => {
      const name = field.name?.trim() || this.slugify(field.label);
      if (!name) {
        throw new BadRequestException('Category field must have a name or label.');
      }
      return {
        ...field,
        name,
        id: field.id,
        options: field.options
          ?.map((option) => option?.trim())
          ?.filter((option) => Boolean(option && option.length > 0)),
      };
    });
  }

  private slugify(value: string): string {
    return (value || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_\-а-яё]/gi, '');
  }

  private resolveFields(category: Category, categoryMap: Map<string, Category>): CategoryFieldWithMeta[] {
    const lineage: Category[] = [];
    let current: Category | undefined = category;
    const visited = new Set<string>();

    while (current) {
      lineage.unshift(current);
      if (!current.parentId) break;
      current = categoryMap.get(current.parentId);
      if (current && visited.has(current.id)) {
        break;
      }
      if (current) {
        visited.add(current.id);
      }
    }

    const resolved: CategoryFieldWithMeta[] = [];
    lineage.forEach((cat) => {
      (cat.fields || []).forEach((field) => {
        const name = field.name?.trim() || this.slugify(field.label);
        if (!name) {
          return;
        }
        const meta: CategoryFieldWithMeta = {
          ...field,
          name,
          inherited: cat.id !== category.id,
          sourceCategoryId: cat.id,
          sourceCategoryName: cat.name,
        };
        const existingIndex = resolved.findIndex((f) => f.name === name);
        if (existingIndex >= 0) {
          resolved[existingIndex] = meta;
        } else {
          resolved.push(meta);
        }
      });
    });

    return resolved;
  }
}
