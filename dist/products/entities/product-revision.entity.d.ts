import { BaseEntity } from '../../database/base.entity';
import { Product } from './product.entity';
import { User } from '../../users/entities/user.entity';
export type ProductRevisionSource = 'CREATE' | 'UPDATE' | 'RESTORE';
export interface ProductRevisionSnapshot {
    title: string;
    description: string;
    category: string;
    price?: number;
    salePrice?: number;
    imageUrls: string[];
    dynamicAttributes: Record<string, string | number>;
    videoUrl?: string;
    productType?: 'PHYSICAL' | 'DIGITAL' | 'SERVICE';
    giftWrapAvailable?: boolean;
    giftWrapPrice?: number;
    purchaseCost?: number;
    weight?: number;
    isB2BEnabled?: boolean;
    b2bMinQuantity?: number;
    b2bPrice?: number;
    variants?: any;
    variantAttributes?: any;
}
export declare class ProductRevision extends BaseEntity {
    product: Product;
    author?: User;
    authorId?: string | null;
    source: ProductRevisionSource;
    snapshot: ProductRevisionSnapshot;
}
