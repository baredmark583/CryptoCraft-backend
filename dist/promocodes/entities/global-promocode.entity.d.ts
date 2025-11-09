import { BaseEntity } from '../../database/base.entity';
export declare class GlobalPromoCode extends BaseEntity {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    isActive: boolean;
    uses: number;
    maxUses?: number;
    minPurchaseAmount?: number;
    validFrom?: Date;
    validUntil?: Date;
    createdBy?: string;
    updatedBy?: string;
}
