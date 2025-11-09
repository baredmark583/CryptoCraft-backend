import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { Product } from './product.entity';
import { User } from '../../users/entities/user.entity';

export type ProductRevisionSource =
  | 'CREATE'
  | 'UPDATE'
  | 'RESTORE';

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

@Entity('product_revisions')
export class ProductRevision extends BaseEntity {
  @ManyToOne(() => Product, (product) => product.revisions, { onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  author?: User;

  @Column({ nullable: true })
  authorId?: string | null;

  @Column({
    type: 'enum',
    enum: ['CREATE', 'UPDATE', 'RESTORE'],
    default: 'UPDATE',
  })
  source: ProductRevisionSource;

  @Column('jsonb')
  snapshot: ProductRevisionSnapshot;
}
