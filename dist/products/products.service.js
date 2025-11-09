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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const product_moderation_event_entity_1 = require("./entities/product-moderation-event.entity");
const product_revision_entity_1 = require("./entities/product-revision.entity");
const user_entity_1 = require("../users/entities/user.entity");
const categories_service_1 = require("../categories/categories.service");
let ProductsService = class ProductsService {
    constructor(productsRepository, moderationEventRepository, revisionsRepository, usersRepository, categoriesService) {
        this.productsRepository = productsRepository;
        this.moderationEventRepository = moderationEventRepository;
        this.revisionsRepository = revisionsRepository;
        this.usersRepository = usersRepository;
        this.categoriesService = categoriesService;
    }
    async create(createProductDto) {
        const { sellerId, ...productData } = createProductDto;
        const seller = await this.usersRepository.findOneBy({ id: sellerId });
        if (!seller) {
            throw new common_1.NotFoundException(`Seller with ID "${sellerId}" not found`);
        }
        const normalizedDynamicAttributes = await this.normalizeDynamicAttributes(productData.category, productData.dynamicAttributes);
        const sanitized = this.sanitizeProductInput({
            ...productData,
            dynamicAttributes: normalizedDynamicAttributes,
            status: 'Pending Moderation',
            rejectionReason: null,
            appealMessage: null,
        });
        const product = this.productsRepository.create({
            ...sanitized,
            seller,
        });
        const saved = await this.productsRepository.save(product);
        await this.logModerationEvent(saved, 'SUBMITTED', 'Товар создан и отправлен на модерацию');
        await this.recordRevision(saved, sellerId, 'CREATE');
        return saved;
    }
    async findAll(query = {}) {
        const qb = this.productsRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.seller', 'seller');
        if (query.category && query.category !== 'Все') {
            qb.andWhere('product.category = :category', { category: query.category });
        }
        if (query.search) {
            qb.andWhere('(product.title ILIKE :search OR product.description ILIKE :search)', {
                search: `%${query.search}%`,
            });
        }
        if (typeof query.priceMin === 'number') {
            qb.andWhere('(product.price IS NOT NULL AND product.price >= :priceMin)', {
                priceMin: query.priceMin,
            });
        }
        if (typeof query.priceMax === 'number') {
            qb.andWhere('(product.price IS NOT NULL AND product.price <= :priceMax)', {
                priceMax: query.priceMax,
            });
        }
        if (query.dynamicFilters) {
            let paramIndex = 0;
            Object.entries(query.dynamicFilters).forEach(([key, value]) => {
                if (value === undefined || value === null)
                    return;
                const sanitizedKey = this.sanitizeDynamicAttributeKey(key);
                if (Array.isArray(value)) {
                    const normalizedValues = value
                        .map((entry) => {
                        if (entry === undefined || entry === null)
                            return undefined;
                        const asString = String(entry).trim();
                        return asString || undefined;
                    })
                        .filter((entry) => Boolean(entry));
                    if (!normalizedValues.length)
                        return;
                    const paramName = `dynValues${paramIndex++}`;
                    qb.andWhere(`product.dynamicAttributes ->> '${sanitizedKey}' IN (:...${paramName})`, {
                        [paramName]: normalizedValues,
                    });
                }
                else {
                    const normalizedValue = String(value).trim();
                    if (!normalizedValue)
                        return;
                    const paramName = `dynValue${paramIndex++}`;
                    qb.andWhere(`product.dynamicAttributes ->> '${sanitizedKey}' = :${paramName}`, {
                        [paramName]: normalizedValue,
                    });
                }
            });
        }
        switch (query.sortBy) {
            case 'priceAsc':
                qb.orderBy('product.price', 'ASC', 'NULLS LAST');
                break;
            case 'priceDesc':
                qb.orderBy('product.price', 'DESC', 'NULLS LAST');
                break;
            case 'rating':
                qb.orderBy('seller.rating', 'DESC');
                break;
            case 'newest':
            default:
                qb.orderBy('product.createdAt', 'DESC');
                break;
        }
        return qb.getMany();
    }
    async findOne(id) {
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: ['seller'],
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID "${id}" not found`);
        }
        return product;
    }
    async update(id, updateProductDto, actorId, actorRole) {
        const product = await this.productsRepository.findOne({
            where: { id },
            relations: ['seller'],
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID "${id}" not found`);
        }
        if (actorId) {
            this.assertCanEdit(product, actorId, actorRole);
        }
        const nextCategory = updateProductDto.category ?? product.category;
        const normalizedDynamicAttributes = await this.normalizeDynamicAttributes(nextCategory, updateProductDto.dynamicAttributes ?? product.dynamicAttributes);
        const sanitized = this.sanitizeProductInput({
            ...updateProductDto,
            category: nextCategory,
            dynamicAttributes: normalizedDynamicAttributes,
        });
        Object.assign(product, sanitized);
        const saved = await this.productsRepository.save(product);
        await this.recordRevision(saved, actorId, 'UPDATE');
        return saved;
    }
    async remove(id) {
        const result = await this.productsRepository.softDelete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Product with ID "${id}" not found`);
        }
    }
    async approveProduct(id, dto, moderatorId) {
        const product = await this.findOne(id);
        const moderator = await this.usersRepository.findOneBy({ id: moderatorId });
        if (!moderator) {
            throw new common_1.NotFoundException(`Moderator with ID "${moderatorId}" not found`);
        }
        const previousStatus = product.status;
        product.status = 'Active';
        product.rejectionReason = null;
        product.appealMessage = null;
        product.moderatedBy = moderator;
        product.moderatedAt = new Date();
        const saved = await this.productsRepository.save(product);
        await this.logModerationEvent(saved, 'APPROVED', dto.note, moderator, previousStatus, 'Active');
        return saved;
    }
    async rejectProduct(id, dto, moderatorId) {
        const product = await this.findOne(id);
        const moderator = await this.usersRepository.findOneBy({ id: moderatorId });
        if (!moderator) {
            throw new common_1.NotFoundException(`Moderator with ID "${moderatorId}" not found`);
        }
        const previousStatus = product.status;
        product.status = 'Rejected';
        product.rejectionReason = dto.reason;
        product.appealMessage = null;
        product.moderatedBy = moderator;
        product.moderatedAt = new Date();
        const saved = await this.productsRepository.save(product);
        await this.logModerationEvent(saved, 'REJECTED', dto.reason, moderator, previousStatus, 'Rejected');
        return saved;
    }
    async appealProduct(id, dto, requesterId) {
        const product = await this.findOne(id);
        if (!product.seller || product.seller.id !== requesterId) {
            throw new common_1.ForbiddenException('Only the product owner can appeal a moderation decision.');
        }
        const previousStatus = product.status;
        product.status = 'Pending Moderation';
        product.appealMessage = dto.message;
        product.moderatedBy = undefined;
        product.moderatedAt = null;
        const saved = await this.productsRepository.save(product);
        await this.logModerationEvent(saved, 'APPEALED', dto.message, undefined, previousStatus, 'Pending Moderation');
        return saved;
    }
    async getModerationEvents(productId, requesterId, role) {
        const product = await this.productsRepository.findOne({
            where: { id: productId },
            relations: ['seller'],
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID "${productId}" not found`);
        }
        const isModerator = this.isModerator(role);
        if (!isModerator && product.seller?.id !== requesterId) {
            throw new common_1.ForbiddenException('You do not have access to this moderation history.');
        }
        return this.moderationEventRepository.find({
            where: { product: { id: productId } },
            relations: ['moderator'],
            order: { createdAt: 'ASC' },
        });
    }
    async getRevisions(productId, requesterId, role) {
        const product = await this.productsRepository.findOne({
            where: { id: productId },
            relations: ['seller'],
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID "${productId}" not found`);
        }
        const isModerator = this.isModerator(role);
        if (!isModerator && product.seller?.id !== requesterId) {
            throw new common_1.ForbiddenException('You do not have access to these revisions.');
        }
        return this.revisionsRepository.find({
            where: { product: { id: productId } },
            relations: ['author'],
            order: { createdAt: 'DESC' },
        });
    }
    async restoreRevision(productId, revisionId, requesterId, role) {
        const product = await this.productsRepository.findOne({
            where: { id: productId },
            relations: ['seller'],
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID "${productId}" not found`);
        }
        this.assertCanEdit(product, requesterId, role);
        const revision = await this.revisionsRepository.findOne({
            where: { id: revisionId },
            relations: ['product'],
        });
        if (!revision || revision.product.id !== productId) {
            throw new common_1.NotFoundException(`Revision with ID "${revisionId}" not found for this product.`);
        }
        this.applySnapshot(product, revision.snapshot);
        const saved = await this.productsRepository.save(product);
        await this.recordRevision(saved, requesterId, 'RESTORE');
        return saved;
    }
    isModerator(role) {
        return role === user_entity_1.UserRole.MODERATOR || role === user_entity_1.UserRole.SUPER_ADMIN;
    }
    assertCanEdit(product, actorId, actorRole) {
        if (product.seller?.id === actorId)
            return;
        if (this.isModerator(actorRole))
            return;
        throw new common_1.ForbiddenException('You are not allowed to edit this product.');
    }
    validateUrl(value) {
        if (!value)
            return;
        try {
            const u = new URL(value);
            if (!['http:', 'https:'].includes(u.protocol))
                throw new Error('Invalid protocol');
        }
        catch (e) {
            throw new common_1.BadRequestException('Invalid URL');
        }
    }
    sanitizeHtml(html) {
        if (!html)
            return html;
        let out = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
        out = out.replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, '');
        out = out.replace(/ on[a-z]+\s*=\s*'[^']*'/gi, '');
        out = out.replace(/ on[a-z]+\s*=\s*[^\s>]+/gi, '');
        return out;
    }
    sanitizeProductInput(data) {
        if (data.description)
            data.description = this.sanitizeHtml(data.description);
        if (Array.isArray(data.imageUrls)) {
            data.imageUrls.forEach((u) => this.validateUrl(u));
        }
        this.validateUrl(data.videoUrl);
        this.validateUrl(data.digitalFileUrl);
        this.validateUrl(data.authenticationReportUrl);
        return data;
    }
    sanitizeDynamicAttributeKey(key) {
        const trimmed = (key || '').trim();
        if (!trimmed || /[^a-zA-Z0-9_\-]/.test(trimmed)) {
            throw new common_1.BadRequestException(`Invalid dynamic attribute key "${key}"`);
        }
        return trimmed;
    }
    async normalizeDynamicAttributes(categoryName, incomingAttributes) {
        const resolvedFields = await this.categoriesService.getResolvedFieldsByName(categoryName);
        if (!resolvedFields || resolvedFields.length === 0) {
            return incomingAttributes ?? {};
        }
        const normalized = {};
        const attrs = incomingAttributes ?? {};
        for (const field of resolvedFields) {
            const value = this.extractDynamicAttributeValue(field, attrs);
            if (value === undefined || value === null || value === '') {
                if (field.required) {
                    throw new common_1.BadRequestException(`Поле "${field.label}" обязательно для категории "${categoryName}".`);
                }
                continue;
            }
            if (field.type === 'number') {
                const parsed = Number(value);
                if (Number.isNaN(parsed)) {
                    throw new common_1.BadRequestException(`Поле "${field.label}" должно быть числом.`);
                }
                normalized[field.name] = parsed;
            }
            else {
                const stringValue = String(value).trim();
                if (!stringValue && field.required) {
                    throw new common_1.BadRequestException(`Поле "${field.label}" обязательно.`);
                }
                if (field.type === 'select' && field.options?.length && !field.options.includes(stringValue)) {
                    throw new common_1.BadRequestException(`Значение "${stringValue}" не входит в список допустимых для поля "${field.label}".`);
                }
                if (stringValue) {
                    normalized[field.name] = stringValue;
                }
            }
        }
        return normalized;
    }
    extractDynamicAttributeValue(field, attributes) {
        if (!attributes)
            return undefined;
        if (Object.prototype.hasOwnProperty.call(attributes, field.name)) {
            return attributes[field.name];
        }
        if (Object.prototype.hasOwnProperty.call(attributes, field.label)) {
            return attributes[field.label];
        }
        return undefined;
    }
    async logModerationEvent(product, action, comment, moderator, previousStatus, nextStatus) {
        const event = this.moderationEventRepository.create({
            product,
            moderator,
            moderatorId: moderator?.id,
            action,
            comment,
            previousStatus: previousStatus ?? product.status,
            nextStatus: nextStatus ?? product.status,
        });
        await this.moderationEventRepository.save(event);
    }
    async recordRevision(product, authorId, source = 'UPDATE') {
        if (!product)
            return;
        const revision = this.revisionsRepository.create({
            product,
            authorId: authorId ?? null,
            source,
            snapshot: this.buildSnapshot(product),
        });
        await this.revisionsRepository.save(revision);
    }
    buildSnapshot(product) {
        return {
            title: product.title,
            description: product.description,
            category: product.category,
            price: product.price,
            salePrice: product.salePrice,
            imageUrls: product.imageUrls,
            dynamicAttributes: product.dynamicAttributes,
            videoUrl: product.videoUrl,
            productType: product.productType,
            giftWrapAvailable: product.giftWrapAvailable,
            giftWrapPrice: product.giftWrapPrice,
            purchaseCost: product.purchaseCost,
            weight: product.weight,
            isB2BEnabled: product.isB2BEnabled,
            b2bMinQuantity: product.b2bMinQuantity,
            b2bPrice: product.b2bPrice,
            variants: product.variants,
            variantAttributes: product.variantAttributes,
        };
    }
    applySnapshot(product, snapshot) {
        product.title = snapshot.title;
        product.description = snapshot.description;
        product.category = snapshot.category;
        product.price = snapshot.price;
        product.salePrice = snapshot.salePrice;
        product.imageUrls = snapshot.imageUrls;
        product.dynamicAttributes = snapshot.dynamicAttributes || {};
        product.videoUrl = snapshot.videoUrl;
        product.productType = snapshot.productType;
        product.giftWrapAvailable = snapshot.giftWrapAvailable;
        product.giftWrapPrice = snapshot.giftWrapPrice;
        product.purchaseCost = snapshot.purchaseCost;
        product.weight = snapshot.weight;
        product.isB2BEnabled = snapshot.isB2BEnabled;
        product.b2bMinQuantity = snapshot.b2bMinQuantity;
        product.b2bPrice = snapshot.b2bPrice;
        product.variants = snapshot.variants;
        product.variantAttributes = snapshot.variantAttributes;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_moderation_event_entity_1.ProductModerationEvent)),
    __param(2, (0, typeorm_1.InjectRepository)(product_revision_entity_1.ProductRevision)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        categories_service_1.CategoriesService])
], ProductsService);
//# sourceMappingURL=products.service.js.map