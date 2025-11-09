import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('livestreams')
export class Livestream extends BaseEntity {
  @Column()
  title: string;

  @ManyToOne(() => User, { eager: true })
  seller: User;

  @Column({ type: 'enum', enum: ['UPCOMING', 'LIVE', 'ENDED'], default: 'UPCOMING' })
  status: 'UPCOMING' | 'LIVE' | 'ENDED';

  @ManyToOne(() => Product, { eager: true })
  featuredProduct: Product;

  @Column({ type: 'bigint', nullable: true })
  scheduledStartTime?: number;

  @Column({ type: 'uuid', nullable: true })
  moderatorId?: string;

  @Column({ default: false })
  isAiModeratorEnabled?: boolean;

  @Column({ nullable: true })
  welcomeMessage?: string;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @Column({ type: 'int', default: 0 })
  viewerCount: number;

  @Column({ default: false })
  isPromoted: boolean;

  @Column({ type: 'int', default: 0 })
  peakViewers: number;

  @Column({ type: 'int', default: 0 })
  totalViewerMinutes: number;

  @Column({ nullable: true })
  recordingUrl?: string;

  @Column({ type: 'int', default: 0 })
  abuseStrikes: number;

  @Column('jsonb', { default: [] })
  abuseReports: { reason: string; reporterId?: string; reportedAt: string }[];

  @Column({ type: 'timestamptz', nullable: true })
  lastAnalyticsAt?: Date;
}
