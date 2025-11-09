import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductModerationEvent, ModerationAction } from './entities/product-moderation-event.entity';
import {
  ProductRevision,
  ProductRevisionSnapshot,
  ProductRevisionSource,
} from './entities/product-revision.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApproveProductDto } from './dto/approve-product.dto';
import { RejectProductDto } from './dto/reject-product.dto';
import { AppealProductDto } from './dto/appeal-product.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { CategoriesService } from '../categories/categories.service';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { CategoryFieldWithMeta } from '../constants';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductModerationEvent)
    private readonly moderationEventRepository: Repository<ProductModerationEvent>,
    @InjectRepository(ProductRevision)
    private readonly revisionsRepository: Repository<ProductRevision>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { sellerId, ...productData } = createProductDto;
    const seller = await this.usersRepository.findOneBy({ id: sellerId });
    if (!seller) {
      throw new NotFoundException(`Seller with ID "${sellerId}" not found`);
    }

    const normalizedDynamicAttributes = await this.normalizeDynamicAttributes(
      productData.category,
      productData.dynamicAttributes,
    );

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

  async findAll(query: FindProductsQueryDto = {}): Promise<Product[]> {
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
        if (value === undefined || value === null) return;
        const sanitizedKey = this.sanitizeDynamicAttributeKey(key);

        if (Array.isArray(value)) {
          const normalizedValues = value
            .map((entry) => {
              if (entry === undefined || entry === null) return undefined;
              const asString = String(entry).trim();
              return asString || undefined;
            })
            .filter((entry): entry is string => Boolean(entry));
          if (!normalizedValues.length) return;
          const paramName = `dynValues${paramIndex++}`;
          qb.andWhere(`product.dynamicAttributes ->> '${sanitizedKey}' IN (:...${paramName})`, {
            [paramName]: normalizedValues,
          });
        } else {
          const normalizedValue = String(value).trim();
          if (!normalizedValue) return;
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

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['seller'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    actorId?: string,
    actorRole?: UserRole,
  ): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['seller'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    if (actorId) {
      this.assertCanEdit(product, actorId, actorRole);
    }

    const nextCategory = updateProductDto.category ?? product.category;
    const normalizedDynamicAttributes = await this.normalizeDynamicAttributes(
      nextCategory,
      updateProductDto.dynamicAttributes ?? product.dynamicAttributes,
    );

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

  async remove(id: string): Promise<void> {
    const result = await this.productsRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
  }

  async approveProduct(id: string, dto: ApproveProductDto, moderatorId: string) {
    const product = await this.findOne(id);
    const moderator = await this.usersRepository.findOneBy({ id: moderatorId });
    if (!moderator) {
      throw new NotFoundException(`Moderator with ID "${moderatorId}" not found`);
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

  async rejectProduct(id: string, dto: RejectProductDto, moderatorId: string) {
    const product = await this.findOne(id);
    const moderator = await this.usersRepository.findOneBy({ id: moderatorId });
    if (!moderator) {
      throw new NotFoundException(`Moderator with ID "${moderatorId}" not found`);
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

  async appealProduct(id: string, dto: AppealProductDto, requesterId: string) {
    const product = await this.findOne(id);
    if (!product.seller || product.seller.id !== requesterId) {
      throw new ForbiddenException('Only the product owner can appeal a moderation decision.');
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

  async getModerationEvents(productId: string, requesterId: string, role: UserRole) {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
      relations: ['seller'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }

    const isModerator = this.isModerator(role);
    if (!isModerator && product.seller?.id !== requesterId) {
      throw new ForbiddenException('You do not have access to this moderation history.');
    }

    return this.moderationEventRepository.find({
      where: { product: { id: productId } },
      relations: ['moderator'],
      order: { createdAt: 'ASC' },
    });
  }

  async getRevisions(productId: string, requesterId: string, role: UserRole) {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
      relations: ['seller'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }
    const isModerator = this.isModerator(role);
    if (!isModerator && product.seller?.id !== requesterId) {
      throw new ForbiddenException('You do not have access to these revisions.');
    }

    return this.revisionsRepository.find({
      where: { product: { id: productId } },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async restoreRevision(productId: string, revisionId: string, requesterId: string, role: UserRole) {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
      relations: ['seller'],
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }

    this.assertCanEdit(product, requesterId, role);

    const revision = await this.revisionsRepository.findOne({
      where: { id: revisionId },
      relations: ['product'],
    });
    if (!revision || revision.product.id !== productId) {
      throw new NotFoundException(`Revision with ID "${revisionId}" not found for this product.`);
    }

    this.applySnapshot(product, revision.snapshot);
    const saved = await this.productsRepository.save(product);
    await this.recordRevision(saved, requesterId, 'RESTORE');
    return saved;
  }

  private isModerator(role?: UserRole) {
    return role === UserRole.MODERATOR || role === UserRole.SUPER_ADMIN;
  }

  private assertCanEdit(product: Product, actorId: string, actorRole?: UserRole) {
    if (product.seller?.id === actorId) return;
    if (this.isModerator(actorRole)) return;
    throw new ForbiddenException('You are not allowed to edit this product.');
  }

  private validateUrl(value?: string) {
    if (!value) return;
    try {
      const u = new URL(value);
      if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Invalid protocol');
    } catch (e) {
      throw new BadRequestException('Invalid URL');
    }
  }

  private sanitizeHtml(html?: string): string | undefined {
    if (!html) return html;
    let out = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    out = out.replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, '');
    out = out.replace(/ on[a-z]+\s*=\s*'[^']*'/gi, '');
    out = out.replace(/ on[a-z]+\s*=\s*[^\s>]+/gi, '');
    return out;
  }

  private sanitizeProductInput(data: Partial<Product>): Partial<Product> {
    if (data.description) data.description = this.sanitizeHtml(data.description) as any;
    if (Array.isArray(data.imageUrls)) {
      data.imageUrls.forEach((u) => this.validateUrl(u));
    }
    this.validateUrl(data.videoUrl);
    this.validateUrl(data.digitalFileUrl);
    this.validateUrl(data.authenticationReportUrl);
    return data;
  }

  private sanitizeDynamicAttributeKey(key: string): string {
    const trimmed = (key || '').trim();
    if (!trimmed || /[^a-zA-Z0-9_\-]/.test(trimmed)) {
      throw new BadRequestException(`Invalid dynamic attribute key "${key}"`);
    }
    return trimmed;
  }

  private async normalizeDynamicAttributes(
    categoryName: string,
    incomingAttributes?: Record<string, any>,
  ): Promise<Record<string, string | number>> {
    const resolvedFields = await this.categoriesService.getResolvedFieldsByName(categoryName);
    if (!resolvedFields || resolvedFields.length === 0) {
      return incomingAttributes ?? {};
    }

    const normalized: Record<string, string | number> = {};
    const attrs = incomingAttributes ?? {};

    for (const field of resolvedFields) {
      const value = this.extractDynamicAttributeValue(field, attrs);
      if (value === undefined || value === null || value === '') {
        if (field.required) {
          throw new BadRequestException(`Поле "${field.label}" обязательно для категории "${categoryName}".`);
        }
        continue;
      }

      if (field.type === 'number') {
        const parsed = Number(value);
        if (Number.isNaN(parsed)) {
          throw new BadRequestException(`Поле "${field.label}" должно быть числом.`);
        }
        normalized[field.name] = parsed;
      } else {
        const stringValue = String(value).trim();
        if (!stringValue && field.required) {
          throw new BadRequestException(`Поле "${field.label}" обязательно.`);
        }
        if (field.type === 'select' && field.options?.length && !field.options.includes(stringValue)) {
          throw new BadRequestException(
            `Значение "${stringValue}" не входит в список допустимых для поля "${field.label}".`,
          );
        }
        if (stringValue) {
          normalized[field.name] = stringValue;
        }
      }
    }

    return normalized;
  }

  private extractDynamicAttributeValue(field: CategoryFieldWithMeta, attributes: Record<string, any>): any {
    if (!attributes) return undefined;
    if (Object.prototype.hasOwnProperty.call(attributes, field.name)) {
      return attributes[field.name];
    }
    if (Object.prototype.hasOwnProperty.call(attributes, field.label)) {
      return attributes[field.label];
    }
    return undefined;
  }

  private async logModerationEvent(
    product: Product,
    action: ModerationAction,
    comment?: string,
    moderator?: User,
    previousStatus?: Product['status'],
    nextStatus?: Product['status'],
  ) {
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

  private async recordRevision(
    product: Product,
    authorId?: string | null,
    source: ProductRevisionSource = 'UPDATE',
  ) {
    if (!product) return;
    const revision = this.revisionsRepository.create({
      product,
      authorId: authorId ?? null,
      source,
      snapshot: this.buildSnapshot(product),
    });
    await this.revisionsRepository.save(revision);
  }

  private buildSnapshot(product: Product): ProductRevisionSnapshot {
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

  private applySnapshot(product: Product, snapshot: ProductRevisionSnapshot) {
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
}
