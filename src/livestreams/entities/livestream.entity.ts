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
}