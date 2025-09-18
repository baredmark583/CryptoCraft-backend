import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { Product } from '../../products/entities/product.entity';

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
  @Column()
  name: string;

  @Column()
  avatarUrl: string;

  @Column({ nullable: true })
  headerImageUrl?: string;

  @Column('decimal', { precision: 2, scale: 1, default: 0.0 })
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

  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  balance: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  commissionOwed: number;

  @Column({ nullable: true, unique: true })
  affiliateId?: string;

  @Column('jsonb', { nullable: true })
  defaultShippingAddress?: ShippingAddress;

  @Column({ nullable: true })
  phoneNumber?: string;

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  // Поле reviews будет добавлено позже как связь с сущностью Review
}