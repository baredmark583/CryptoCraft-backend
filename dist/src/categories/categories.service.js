"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("./entities/category.entity");
let CategoriesService = class CategoriesService {
    constructor(categoryRepository, dataSource) {
        this.categoryRepository = categoryRepository;
        this.dataSource = dataSource;
    }
    create(createCategoryDto) {
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
        const categoryMap = new Map();
        const rootCategories = [];
        allCategories.forEach(category => {
            category.subcategories = [];
            categoryMap.set(category.id, category);
        });
        allCategories.forEach(category => {
            if (category.parentId && categoryMap.has(category.parentId)) {
                const parent = categoryMap.get(category.parentId);
                parent.subcategories.push(category);
            }
            else {
                rootCategories.push(category);
            }
        });
        const enrich = (category) => {
            const resolvedFields = this.resolveFields(category, categoryMap);
            category.resolvedFields = resolvedFields;
            if (category.subcategories) {
                category.subcategories = category.subcategories.map((child) => enrich(child));
            }
            return category;
        };
        return rootCategories.map((root) => enrich(root));
    }
    async findOne(id) {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['subcategories'],
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }
    async update(id, updateCategoryDto) {
        const updatePayload = {
            ...updateCategoryDto,
            fields: updateCategoryDto.fields
                ? this.normalizeFields(updateCategoryDto.fields)
                : undefined,
        };
        if (updatePayload.fields) {
            updatePayload.fields.forEach(field => {
                if (field.id && field.id.startsWith('new_')) {
                    delete field.id;
                }
            });
        }
        const category = await this.categoryRepository.preload({ id, ...updatePayload });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return this.categoryRepository.save(category);
    }
    async remove(id) {
        const result = await this.categoryRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return { success: true };
    }
    async batchCreate(categories) {
        await this.dataSource.transaction(async (manager) => {
            await manager.query('TRUNCATE TABLE "categories" RESTART IDENTITY CASCADE');
            const saveCategoriesRecursive = async (categoriesToSave, parentId) => {
                for (const categoryData of categoriesToSave) {
                    const newCategory = manager.create(category_entity_1.Category, {
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
    async batchCreateSubcategories(categories, parentId) {
        const parentCategory = await this.categoryRepository.findOneBy({ id: parentId });
        if (!parentCategory) {
            throw new common_1.NotFoundException(`Parent category with ID ${parentId} not found.`);
        }
        await this.dataSource.transaction(async (manager) => {
            const saveCategoriesRecursive = async (categoriesToSave, currentParentId) => {
                for (const categoryData of categoriesToSave) {
                    const newCategory = manager.create(category_entity_1.Category, {
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
            await manager.delete(category_entity_1.Category, { parentId });
            await saveCategoriesRecursive(categories, parentId);
        });
    }
    async getResolvedFieldsById(categoryId) {
        const allCategories = await this.categoryRepository.find();
        const category = allCategories.find((cat) => cat.id === categoryId);
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${categoryId} not found.`);
        }
        const map = new Map(allCategories.map((cat) => [cat.id, cat]));
        return this.resolveFields(category, map);
    }
    async getResolvedFieldsByName(categoryName) {
        const allCategories = await this.categoryRepository.find();
        const category = allCategories.find((cat) => cat.name === categoryName);
        if (!category) {
            throw new common_1.NotFoundException(`Category with name "${categoryName}" not found.`);
        }
        const map = new Map(allCategories.map((cat) => [cat.id, cat]));
        return this.resolveFields(category, map);
    }
    normalizeFields(fields) {
        if (!fields)
            return [];
        return fields.map((field) => {
            const name = field.name?.trim() || this.slugify(field.label);
            if (!name) {
                throw new common_1.BadRequestException('Category field must have a name or label.');
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
    slugify(value) {
        return (value || '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_\-а-яё]/gi, '');
    }
    resolveFields(category, categoryMap) {
        const lineage = [];
        let current = category;
        const visited = new Set();
        while (current) {
            lineage.unshift(current);
            if (!current.parentId)
                break;
            current = categoryMap.get(current.parentId);
            if (current && visited.has(current.id)) {
                break;
            }
            if (current) {
                visited.add(current.id);
            }
        }
        const resolved = [];
        lineage.forEach((cat) => {
            (cat.fields || []).forEach((field) => {
                const name = field.name?.trim() || this.slugify(field.label);
                if (!name) {
                    return;
                }
                const meta = {
                    ...field,
                    name,
                    inherited: cat.id !== category.id,
                    sourceCategoryId: cat.id,
                    sourceCategoryName: cat.name,
                };
                const existingIndex = resolved.findIndex((f) => f.name === name);
                if (existingIndex >= 0) {
                    resolved[existingIndex] = meta;
                }
                else {
                    resolved.push(meta);
                }
            });
        });
        return resolved;
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map