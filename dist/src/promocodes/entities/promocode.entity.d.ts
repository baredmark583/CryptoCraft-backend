import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
export declare class PromoCode extends BaseEntity {
    seller: User;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    isActive: boolean;
    uses: number;
    maxUses?: number;
    minPurchaseAmount?: number;
    scope: 'ENTIRE_ORDER' | 'CATEGORY';
    applicableCategory?: string;
    validUntil?: number;
}
