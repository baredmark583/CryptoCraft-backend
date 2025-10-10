import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity, DecimalTransformer } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('promocodes')
export class PromoCode extends BaseEntity {
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  seller: User;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'enum', enum: ['PERCENTAGE', 'FIXED_AMOUNT'] })
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';

  @Column('decimal', { precision: 10, scale: 2, transformer: new DecimalTransformer() })
  discountValue: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  uses: number;

  @Column({ nullable: true })
  maxUses?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, transformer: new DecimalTransformer() })
  minPurchaseAmount?: number;

  @Column({ type: 'enum', enum: ['ENTIRE_ORDER', 'CATEGORY'], default: 'ENTIRE_ORDER' })
  scope: 'ENTIRE_ORDER' | 'CATEGORY';

  @Column({ nullable: true })
  applicableCategory?: string;

  @Column('bigint', { nullable: true })
  validUntil?: number;
}