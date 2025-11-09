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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const product_entity_1 = require("../products/entities/product.entity");
const dispute_entity_1 = require("../disputes/entities/dispute.entity");
let UsersService = class UsersService {
    constructor(usersRepository, ordersRepository, productsRepository, disputesRepository) {
        this.usersRepository = usersRepository;
        this.ordersRepository = ordersRepository;
        this.productsRepository = productsRepository;
        this.disputesRepository = disputesRepository;
    }
    create(createUserDto) {
        const user = this.usersRepository.create(createUserDto);
        return this.usersRepository.save(user);
    }
    async findByTelegramIdOrCreate(telegramUser) {
        const existingUser = await this.usersRepository.findOne({
            where: { telegramId: telegramUser.id },
        });
        if (existingUser) {
            existingUser.name = `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim();
            existingUser.avatarUrl = telegramUser.photo_url || 'default_avatar_url';
            return this.usersRepository.save(existingUser);
        }
        const newUser = this.usersRepository.create({
            telegramId: telegramUser.id,
            name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
            avatarUrl: telegramUser.photo_url || 'default_avatar_url',
            rating: 0,
            following: [],
            balance: 0,
            commissionOwed: 0,
        });
        return this.usersRepository.save(newUser);
    }
    findAll() {
        return this.usersRepository.find();
    }
    async findOne(id) {
        const user = await this.usersRepository.findOneBy({ id });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        return user;
    }
    async findOneWithDetails(id) {
        const user = await this.findOne(id);
        const products = await this.productsRepository.find({
            where: { seller: { id } },
            order: { createdAt: 'DESC' }
        });
        const sales = await this.ordersRepository.find({
            where: { seller: { id } },
            relations: ['buyer', 'items', 'items.product'],
            order: { createdAt: 'DESC' }
        });
        const purchases = await this.ordersRepository.find({
            where: { buyer: { id } },
            relations: ['seller', 'items', 'items.product'],
            order: { createdAt: 'DESC' }
        });
        const disputes = await this.disputesRepository.find({
            where: [
                { order: { buyer: { id } } },
                { order: { seller: { id } } },
            ],
            relations: ['order'],
            order: { createdAt: 'DESC' }
        });
        const gmv = sales.reduce((sum, order) => sum + order.total, 0);
        const totalSpent = purchases.reduce((sum, order) => sum + order.total, 0);
        const platformCommission = gmv * 0.02;
        return {
            ...user,
            products,
            sales,
            purchases,
            disputes,
            financials: {
                gmv,
                totalSpent,
                platformCommission,
            }
        };
    }
    async update(id, updateUserDto) {
        const user = await this.usersRepository.preload({
            id: id,
            ...updateUserDto,
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        return this.usersRepository.save(user);
    }
    async remove(id) {
        const result = await this.usersRepository.softDelete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(dispute_entity_1.Dispute)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map