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
exports.PromoCodesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const promocode_entity_1 = require("./entities/promocode.entity");
const user_entity_1 = require("../users/entities/user.entity");
let PromoCodesService = class PromoCodesService {
    constructor(promoCodeRepository, userRepository) {
        this.promoCodeRepository = promoCodeRepository;
        this.userRepository = userRepository;
    }
    async create(sellerId, createDto) {
        const seller = await this.userRepository.findOneBy({ id: sellerId });
        if (!seller)
            throw new common_1.NotFoundException('Seller not found');
        const promoCode = this.promoCodeRepository.create({ ...createDto, seller });
        return this.promoCodeRepository.save(promoCode);
    }
    async findOne(id, userId) {
        const promoCode = await this.promoCodeRepository.findOne({ where: { id }, relations: ['seller'] });
        if (!promoCode)
            throw new common_1.NotFoundException('Promo code not found');
        if (promoCode.seller.id !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return promoCode;
    }
    async findBySellerId(sellerId) {
        return this.promoCodeRepository.find({
            where: { seller: { id: sellerId } },
            order: { createdAt: 'DESC' },
        });
    }
    async validate(validateDto) {
        const { code, sellerId, items } = validateDto;
        const promoCode = await this.promoCodeRepository.findOne({
            where: { code: code.toUpperCase(), seller: { id: sellerId }, isActive: true },
        });
        if (!promoCode)
            throw new common_1.BadRequestException('Промокод не найден или неактивен.');
        if (promoCode.maxUses && promoCode.uses >= promoCode.maxUses) {
            throw new common_1.BadRequestException('Лимит использования этого промокода исчерпан.');
        }
        if (promoCode.validUntil && promoCode.validUntil < Date.now()) {
            throw new common_1.BadRequestException('Срок действия промокода истек.');
        }
        const relevantItems = items.filter(item => item.product.seller.id === sellerId);
        const subtotal = relevantItems.reduce((sum, item) => sum + item.priceAtTimeOfAddition * item.quantity, 0);
        if (promoCode.minPurchaseAmount && subtotal < promoCode.minPurchaseAmount) {
            throw new common_1.BadRequestException(`Минимальная сумма заказа для этого кода: ${promoCode.minPurchaseAmount} USDT.`);
        }
        if (promoCode.scope === 'CATEGORY') {
            const hasApplicableItem = relevantItems.some(item => item.product.category === promoCode.applicableCategory);
            if (!hasApplicableItem) {
                throw new common_1.BadRequestException(`Этот промокод действителен только для товаров из категории "${promoCode.applicableCategory}".`);
            }
        }
        return {
            discountValue: promoCode.discountValue,
            discountType: promoCode.discountType
        };
    }
    async remove(id, sellerId) {
        const result = await this.promoCodeRepository.delete({ id, seller: { id: sellerId } });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Promo code not found or you don't have permission to delete it.`);
        }
    }
};
exports.PromoCodesService = PromoCodesService;
exports.PromoCodesService = PromoCodesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(promocode_entity_1.PromoCode)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PromoCodesService);
//# sourceMappingURL=promocodes.service.js.map