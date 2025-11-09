import { Repository } from 'typeorm';
import { PromoCode } from './entities/promocode.entity';
import { User } from '../users/entities/user.entity';
import { CreatePromoCodeDto } from './dto/create-promocode.dto';
import { ValidatePromoCodeDto } from './dto/validate-promocode.dto';
export declare class PromoCodesService {
    private readonly promoCodeRepository;
    private readonly userRepository;
    constructor(promoCodeRepository: Repository<PromoCode>, userRepository: Repository<User>);
    create(sellerId: string, createDto: CreatePromoCodeDto): Promise<PromoCode>;
    findOne(id: string, userId: string): Promise<PromoCode>;
    findBySellerId(sellerId: string): Promise<PromoCode[]>;
    validate(validateDto: ValidatePromoCodeDto): Promise<{
        discountValue: number;
        discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    }>;
    remove(id: string, sellerId: string): Promise<void>;
}
