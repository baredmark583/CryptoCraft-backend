import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
export declare class Collection extends BaseEntity {
    user: User;
    name: string;
    products: Product[];
}
