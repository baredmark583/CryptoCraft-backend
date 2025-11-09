export declare class FindProductsQueryDto {
    category?: string;
    search?: string;
    sortBy?: 'priceAsc' | 'priceDesc' | 'rating' | 'newest';
    priceMin?: number;
    priceMax?: number;
    dynamicFilters?: Record<string, string | number | (string | number)[]>;
}
