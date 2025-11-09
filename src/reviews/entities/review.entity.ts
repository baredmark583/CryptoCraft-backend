import { Entity, Column, ManyToOne, RelationId } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

export interface ReviewMediaAttachment {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  name?: string;
  mimeType?: string;
  size?: number;
}

export interface ReviewBehaviorSignal {
  code: string;
  weight: number;
  detail?: string;
  triggeredAt: string;
}

@Entity('reviews')
export class Review extends BaseEntity {
  @ManyToOne(() => Product, (product) => product.reviews, { onDelete: 'CASCADE' })
  product: Product;

  @RelationId((review: Review) => review.product)
  productId: string;

  @ManyToOne(() => User, (user) => user.reviews, { eager: true, onDelete: 'CASCADE' })
  author: User;

  @Column({ type: 'int' })
  rating: number;

  @Column('text', { nullable: true })
  text?: string;

  @Column('jsonb', { default: [] })
  attachments: ReviewMediaAttachment[];

  @Column({ nullable: true })
  imageUrl?: string; // legacy single attachment, kept for backward compatibility

  @Column({ nullable: true })
  sourceOrderId?: string;

  @Column({ nullable: true })
  sourceOrderItemId?: string;

  @Column({ type: 'timestamptz', nullable: true })
  verifiedDeliveryAt?: Date;

  @Column('jsonb', { default: [] })
  behaviorSignals: ReviewBehaviorSignal[];

  @Column({ type: 'int', default: 0 })
  fraudScore: number;

  @Column({ default: false })
  isHidden: boolean;

  @Column('text', { array: true, default: '{}' })
  moderationFlags: string[];

  // 'timestamp' from frontend corresponds to 'createdAt' from BaseEntity
}
