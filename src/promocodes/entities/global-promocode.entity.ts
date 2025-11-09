import { Column, Entity } from 'typeorm';
import { BaseEntity, DecimalTransformer } from '../../database/base.entity';

@Entity('global_promocodes')
export class GlobalPromoCode extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column({ type: 'enum', enum: ['PERCENTAGE', 'FIXED_AMOUNT'] })
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';

  @Column('decimal', { precision: 10, scale: 2, transformer: new DecimalTransformer() })
  discountValue: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  uses: number;

  @Column({ type: 'int', nullable: true })
  maxUses?: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, transformer: new DecimalTransformer() })
  minPurchaseAmount?: number;

  @Column({ type: 'timestamptz', nullable: true })
  validFrom?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  validUntil?: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;
}
