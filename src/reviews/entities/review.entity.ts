import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('reviews')
export class Review extends BaseEntity {
  @ManyToOne(() => Product, (product) => product.reviews, { onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => User, (user) => user.reviews, { eager: true, onDelete: 'CASCADE' })
  author: User;

  @Column({ type: 'int' })
  rating: number;

  @Column('text')
  text: string;

  @Column({ nullable: true })
  imageUrl?: string;
  
  // 'timestamp' from frontend corresponds to 'createdAt' from BaseEntity
}