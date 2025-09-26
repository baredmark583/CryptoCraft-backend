import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { Order } from '../../orders/entities/order.entity';

export interface DisputeMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    timestamp: number;
    text?: string;
    imageUrl?: string;
}

@Entity('disputes')
export class Dispute extends BaseEntity {
  @OneToOne(() => Order, (order) => order.dispute, { onDelete: 'CASCADE' })
  @JoinColumn()
  order: Order;

  @Column({
    type: 'enum',
    enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED_BUYER', 'RESOLVED_SELLER'],
    default: 'OPEN',
  })
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_BUYER' | 'RESOLVED_SELLER';

  @Column('jsonb', { default: [] })
  messages: DisputeMessage[];
}
