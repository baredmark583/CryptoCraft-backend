declare class CartItemValidationDto {
    product: {
        id: string;
        seller: {
            id: string;
        };
        category: string;
    };
    quantity: number;
    priceAtTimeOfAddition: number;
}
export declare class ValidatePromoCodeDto {
    code: string;
    sellerId: string;
    items: CartItemValidationDto[];
}
export {};
