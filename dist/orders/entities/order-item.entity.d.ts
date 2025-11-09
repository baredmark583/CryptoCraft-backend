import { BaseEntity } from '../../database/base.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from './order.entity';
import { ProductVariant } from '../../products/entities/product.entity';
export declare class OrderItem extends BaseEntity {
    order: Order;
    product: Product;
    quantity: number;
    price: number;
    variant?: ProductVariant;
    purchaseType: 'RETAIL' | 'WHOLESALE';
}
