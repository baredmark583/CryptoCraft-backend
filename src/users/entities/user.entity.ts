import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity, DecimalTransformer } from '../../database/base.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';

export type VerificationLevel = 'NONE' | 'PRO';

// Эти типы импортированы для справки из frontend/types.ts
// В TypeORM они будут представлены через jsonb
export interface BusinessInfo {
  registrationNumber: string;
}
export interface ShippingAddress {
  city: string;
  postOffice: string;
  recipientName: string;
  phoneNumber: string;
}

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'bigint', unique: true, nullable: true })
  telegramId: number;

  @Column()
  name: string;

  @Column()
  avatarUrl: string;

  @Column({ nullable: true })
  headerImageUrl?: string;

  @Column('decimal', {
    precision: 2,
    scale: 1,
    default: 0.0,
    transformer: new DecimalTransformer(),
  })
  rating: number;

  @Column({
    type: 'enum',
    enum: ['NONE', 'PRO'],
    default: 'NONE',
  })
  verificationLevel: VerificationLevel;

  @Column('jsonb', { nullable: true })
  businessInfo?: BusinessInfo;

  @Column('simple-array', { default: [] })
  following: string[];

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: new DecimalTransformer(),
  })
  balance: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0.0,
    transformer: new DecimalTransformer(),
  })
  commissionOwed: number;

  @Column({ nullable: true, unique: true })
  affiliateId?: string;

  @Column('jsonb', { nullable: true })
  defaultShippingAddress?: ShippingAddress;

  @Column({ nullable: true })
  phoneNumber?: string;

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  @OneToMany(() => Order, (order) => order.buyer)
  purchases: Order[];

  @OneToMany(() => Order, (order) => order.seller)
  sales: Order[];

  // Поле reviews будет добавлено позже как связь с сущностью Review
}
