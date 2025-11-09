import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { Product } from './product.entity';
import { User } from '../../users/entities/user.entity';
import type { ModerationStatus } from './product.entity';

export type ModerationAction = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'APPEALED' | 'REOPENED';

@Entity('product_moderation_events')
export class ProductModerationEvent extends BaseEntity {
  @ManyToOne(() => Product, (product) => product.moderationEvents, { onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  moderator?: User;

  @Column({ nullable: true })
  moderatorId?: string;

  @Column({
    type: 'enum',
    enum: ['SUBMITTED', 'APPROVED', 'REJECTED', 'APPEALED', 'REOPENED'],
  })
  action: ModerationAction;

  @Column('text', { nullable: true })
  comment?: string;

  @Column({
    type: 'enum',
    enum: ['Pending Moderation', 'Active', 'Rejected'],
    nullable: true,
  })
  previousStatus?: ModerationStatus | null;

  @Column({
    type: 'enum',
    enum: ['Pending Moderation', 'Active', 'Rejected'],
    nullable: true,
  })
  nextStatus?: ModerationStatus | null;
}
