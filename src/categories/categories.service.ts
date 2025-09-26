import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAll() {
    const allCategories = await this.categoryRepository.find({
        order: { name: 'ASC' }
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

    return rootCategories;
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
    const updatePayload: Partial<Category> = { ...updateCategoryDto };

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
}
