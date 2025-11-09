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

export type DisputePriority = 'LOW' | 'NORMAL' | 'URGENT';
export type DisputeTier = 'LEVEL1' | 'LEVEL2' | 'SUPERVISOR';
export type DisputeAutoAction = 'NONE' | 'AUTO_RELEASE' | 'AUTO_REFUND' | 'AUTO_ESCALATE';

export interface DisputeResolutionTemplate {
  id: string;
  title: string;
  body: string;
  action: 'REFUND_BUYER' | 'RELEASE_FUNDS' | 'PARTIAL_REFUND';
}

export interface DisputeAutomationLogEntry {
  id: string;
  type: 'SLA_BREACH' | 'AUTO_RELEASE' | 'AUTO_REFUND' | 'AUTO_ESCALATE';
  message: string;
  createdAt: string;
}

export interface DisputeInternalNote {
  id: string;
  authorId: string;
  authorName: string;
  note: string;
  createdAt: string;
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

  @Column({ type: 'enum', enum: ['LOW', 'NORMAL', 'URGENT'], default: 'NORMAL' })
  priority: DisputePriority;

  @Column({ type: 'enum', enum: ['LEVEL1', 'LEVEL2', 'SUPERVISOR'], default: 'LEVEL1' })
  assignedTier: DisputeTier;

  @Column({ nullable: true })
  assignedArbitratorId?: string;

  @Column({ type: 'timestamptz', nullable: true })
  responseSlaDueAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastAgentResponseAt?: Date;

  @Column({ type: 'int', default: 0 })
  slaBreachCount: number;

  @Column({ type: 'enum', enum: ['NONE', 'AUTO_RELEASE', 'AUTO_REFUND', 'AUTO_ESCALATE'], default: 'NONE' })
  pendingAutoAction: DisputeAutoAction;

  @Column({ type: 'timestamptz', nullable: true })
  pendingAutoActionAt?: Date;

  @Column('jsonb', { default: [] })
  automationLog: DisputeAutomationLogEntry[];

  @Column('jsonb', { default: [] })
  resolutionTemplates: DisputeResolutionTemplate[];

  @Column('jsonb', { default: [] })
  internalNotes: DisputeInternalNote[];
}
