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
exports.CollectionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const collection_entity_1 = require("./entities/collection.entity");
const user_entity_1 = require("../users/entities/user.entity");
const product_entity_1 = require("../products/entities/product.entity");
let CollectionsService = class CollectionsService {
    constructor(collectionRepository, userRepository, productRepository) {
        this.collectionRepository = collectionRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }
    async create(userId, createDto) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const collection = this.collectionRepository.create({ ...createDto, user, products: [] });
        return this.collectionRepository.save(collection);
    }
    async findByUserId(userId) {
        const collections = await this.collectionRepository.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
            relations: ['products']
        });
        return collections.map(c => ({ ...c, productIds: c.products.map(p => p.id) }));
    }
    async findOne(collectionId, userId) {
        const collection = await this.collectionRepository.findOne({ where: { id: collectionId }, relations: ['user', 'products'] });
        if (!collection)
            throw new common_1.NotFoundException('Collection not found');
        if (collection.user.id !== userId)
            throw new common_1.ForbiddenException('Access denied');
        const collectionWithProductIds = { ...collection, productIds: collection.products.map(p => p.id) };
        return { collection: collectionWithProductIds, products: collection.products };
    }
    async addProduct(collectionId, productId, userId) {
        const { collection } = await this.findOne(collectionId, userId);
        const product = await this.productRepository.findOneBy({ id: productId });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const isProductInCollection = collection.products.some(p => p.id === productId);
        if (!isProductInCollection) {
            collection.products.push(product);
            await this.collectionRepository.save(collection);
        }
    }
    async removeProduct(collectionId, productId, userId) {
        const { collection } = await this.findOne(collectionId, userId);
        collection.products = collection.products.filter(p => p.id !== productId);
        await this.collectionRepository.save(collection);
    }
};
exports.CollectionsService = CollectionsService;
exports.CollectionsService = CollectionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(collection_entity_1.Collection)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CollectionsService);
//# sourceMappingURL=collections.service.js.map