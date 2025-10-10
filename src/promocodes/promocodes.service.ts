import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromoCode } from './entities/promocode.entity';
import { User } from '../users/entities/user.entity';
import { CreatePromoCodeDto } from './dto/create-promocode.dto';
import { ValidatePromoCodeDto } from './dto/validate-promocode.dto';

@Injectable()
export class PromoCodesService {
  constructor(
    @InjectRepository(PromoCode)
    private readonly promoCodeRepository: Repository<PromoCode>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(sellerId: string, createDto: CreatePromoCodeDto): Promise<PromoCode> {
    const seller = await this.userRepository.findOneBy({ id: sellerId });
    if (!seller) throw new NotFoundException('Seller not found');

    const promoCode = this.promoCodeRepository.create({ ...createDto, seller });
    return this.promoCodeRepository.save(promoCode);
  }

  async findOne(id: string, userId: string): Promise<PromoCode> {
    const promoCode = await this.promoCodeRepository.findOne({ where: { id }, relations: ['seller'] });
    if (!promoCode) throw new NotFoundException('Promo code not found');
    if (promoCode.seller.id !== userId) throw new ForbiddenException('Access denied');
    return promoCode;
  }

  async findBySellerId(sellerId: string): Promise<PromoCode[]> {
    return this.promoCodeRepository.find({
      where: { seller: { id: sellerId } },
      order: { createdAt: 'DESC' },
    });
  }

  async validate(validateDto: ValidatePromoCodeDto): Promise<{ discountValue: number, discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' }> {
    const { code, sellerId, items } = validateDto;
    const promoCode = await this.promoCodeRepository.findOne({
      where: { code: code.toUpperCase(), seller: { id: sellerId }, isActive: true },
    });
    
    if (!promoCode) throw new BadRequestException('Промокод не найден или неактивен.');
    
    // Check usage limits
    if (promoCode.maxUses && promoCode.uses >= promoCode.maxUses) {
        throw new BadRequestException('Лимит использования этого промокода исчерпан.');
    }
    
    // Check expiration date
    if (promoCode.validUntil && promoCode.validUntil < Date.now()) {
        throw new BadRequestException('Срок действия промокода истек.');
    }

    const relevantItems = items.filter(item => item.product.seller.id === sellerId);
    const subtotal = relevantItems.reduce((sum, item) => sum + item.priceAtTimeOfAddition * item.quantity, 0);

    // Check minimum purchase amount
    if (promoCode.minPurchaseAmount && subtotal < promoCode.minPurchaseAmount) {
        throw new BadRequestException(`Минимальная сумма заказа для этого кода: ${promoCode.minPurchaseAmount} USDT.`);
    }

    // Check category scope
    if (promoCode.scope === 'CATEGORY') {
        const hasApplicableItem = relevantItems.some(item => item.product.category === promoCode.applicableCategory);
        if (!hasApplicableItem) {
            throw new BadRequestException(`Этот промокод действителен только для товаров из категории "${promoCode.applicableCategory}".`);
        }
    }

    return {
        discountValue: promoCode.discountValue,
        discountType: promoCode.discountType
    };
  }

  async remove(id: string, sellerId: string): Promise<void> {
    const result = await this.promoCodeRepository.delete({ id, seller: { id: sellerId } });
    if (result.affected === 0) {
      throw new NotFoundException(`Promo code not found or you don't have permission to delete it.`);
    }
  }
}