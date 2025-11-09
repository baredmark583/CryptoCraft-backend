import { Entity, Column, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity, DecimalTransformer } from '../../database/base.entity';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { EscrowEvent } from './escrow-event.entity';

export type EscrowStatus =
  | 'AWAITING_PAYMENT'
  | 'PENDING_CONFIRMATION'
  | 'FUNDED'
  | 'RELEASED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'CANCELLED'
  | 'DISPUTED';

export type EscrowNetwork = 'TON';
export type EscrowCurrency = 'USDT';
export type EscrowType = 'CART' | 'DEPOSIT';

@Entity('escrow_transactions')
export class EscrowTransaction extends BaseEntity {
  @OneToOne(() => Order, (order) => order.escrow, { onDelete: 'CASCADE' })
  @JoinColumn()
  order: Order;

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL', nullable: true })
  buyer: User | null;

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL', nullable: true })
  seller: User | null;

  @Column('decimal', {
    precision: 12,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['USDT'],
    default: 'USDT',
  })
  currency: EscrowCurrency;

  @Column({
    type: 'enum',
    enum: ['TON'],
    default: 'TON',
  })
  network: EscrowNetwork;

  @Column({
    type: 'enum',
    enum: [
      'AWAITING_PAYMENT',
      'PENDING_CONFIRMATION',
      'FUNDED',
      'RELEASED',
      'REFUNDED',
      'PARTIALLY_REFUNDED',
      'CANCELLED',
      'DISPUTED',
    ],
    default: 'AWAITING_PAYMENT',
  })
  status: EscrowStatus;

  @Column({
    type: 'enum',
    enum: ['CART', 'DEPOSIT'],
    default: 'CART',
  })
  escrowType: EscrowType;

  @Column({ nullable: true })
  depositTransactionHash?: string;

  @Column({ nullable: true })
  releaseTransactionHash?: string;

  @Column({ nullable: true })
  refundTransactionHash?: string;

  @Column('jsonb', { default: {} })
  metadata: Record<string, any>;

  @OneToMany(() => EscrowEvent, (event) => event.escrow, { cascade: true })
  events: EscrowEvent[];
}
