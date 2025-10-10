import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';

export type NotificationType = 'new_message' | 'sale' | 'new_review' | 'outbid' | 'auction_won' | 'auction_ended_seller' | 'new_dispute_seller' | 'new_listing_from_followed' | 'personal_offer';

@Entity('notifications')
export class Notification extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'enum', enum: ['new_message', 'sale', 'new_review', 'outbid', 'auction_won', 'auction_ended_seller', 'new_dispute_seller', 'new_listing_from_followed', 'personal_offer'] })
  type: NotificationType;
  
  @Column('text')
  text: string;

  @Column()
  link: string;

  @Column({ default: false })
  read: boolean;
}