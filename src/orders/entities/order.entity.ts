import { Entity, Column, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity, DecimalTransformer } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { ShippingAddress } from '../../users/entities/user.entity';
import { Dispute } from '../../disputes/entities/dispute.entity';
import { EscrowTransaction } from '../../escrow/entities/escrow-transaction.entity';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'DISPUTED'
  | 'COMPLETED'
  | 'CANCELLED';

export type CheckoutMode = 'CART' | 'DEPOSIT';

@Entity('orders') // Explicitly name the table 'orders'
export class Order extends BaseEntity {
  @ManyToOne(() => User, (user) => user.purchases, { eager: true, onDelete: 'SET NULL', nullable: true })
  buyer: User;

  @ManyToOne(() => User, (user) => user.sales, { eager: true, onDelete: 'SET NULL', nullable: true })
  seller: User;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
  })
  total: number;

  @Column({
    type: 'enum',
    enum: [
      'PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'DISPUTED', 'COMPLETED', 'CANCELLED',
    ],
    default: 'PENDING',
  })
  status: OrderStatus;

  @Column('bigint', { transformer: { from: (value: string) => parseInt(value, 10), to: (value: number) => value } })
  orderDate: number;

  @Column('jsonb', { nullable: true })
  shippingAddress?: ShippingAddress;

  @Column({
    type: 'enum',
    enum: ['NOVA_POSHTA', 'UKRPOSHTA', 'MEETUP'],
    default: 'NOVA_POSHTA',
  })
  shippingMethod: 'NOVA_POSHTA' | 'UKRPOSHTA' | 'MEETUP';
  
  @Column()
  paymentMethod: 'ESCROW' | 'DIRECT';

  @Column({ nullable: true })
  trackingNumber?: string;
  
  @Column({ nullable: true })
  transactionHash?: string;
  
  @OneToOne(() => Dispute, (dispute) => dispute.order, { cascade: true, eager: true, nullable: true })
  dispute?: Dispute;

  @Column({
    type: 'enum',
    enum: ['CART', 'DEPOSIT'],
    default: 'CART',
  })
  checkoutMode: CheckoutMode;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new DecimalTransformer(),
    nullable: true,
  })
  depositAmount?: number;

  @Column('jsonb', { nullable: true })
  meetingDetails?: {
    scheduledAt?: string;
    location?: string;
    notes?: string;
  };

  @OneToOne(() => EscrowTransaction, (escrow) => escrow.order, {
    eager: true,
    nullable: true,
  })
  escrow?: EscrowTransaction;
}
