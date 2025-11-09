import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { EscrowTransaction } from './escrow-transaction.entity';

export type EscrowEventType =
  | 'STATUS_CHANGE'
  | 'PAYMENT_DETECTED'
  | 'WEBHOOK'
  | 'MANUAL_ACTION'
  | 'NOTE';

@Entity('escrow_events')
export class EscrowEvent extends BaseEntity {
  @ManyToOne(() => EscrowTransaction, (escrow) => escrow.events, {
    onDelete: 'CASCADE',
  })
  escrow: EscrowTransaction;

  @Column({
    type: 'enum',
    enum: ['STATUS_CHANGE', 'PAYMENT_DETECTED', 'WEBHOOK', 'MANUAL_ACTION', 'NOTE'],
    default: 'NOTE',
  })
  type: EscrowEventType;

  @Column({ nullable: true })
  description?: string;

  @Column('jsonb', { nullable: true })
  payload?: Record<string, any>;

  @Column({ nullable: true })
  performedByUserId?: string;

  @Column({ nullable: true })
  performedByRole?: 'USER' | 'SELLER' | 'ADMIN' | 'SYSTEM';
}
