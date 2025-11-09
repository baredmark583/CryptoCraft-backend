export declare class CreateGlobalPromoCodeDto {
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    isActive?: boolean;
    maxUses?: number;
    minPurchaseAmount?: number;
    validFrom?: string;
    validUntil?: string;
}
