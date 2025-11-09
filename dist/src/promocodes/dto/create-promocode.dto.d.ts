export declare class CreatePromoCodeDto {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    maxUses?: number;
    minPurchaseAmount?: number;
    scope: 'ENTIRE_ORDER' | 'CATEGORY';
    applicableCategory?: string;
    validUntil?: number;
}
