import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Chat } from './chat.entity';
import { Product } from '../../products/entities/product.entity';

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name?: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
}

export interface MessageReadReceipt {
  userId: string;
  readAt: Date;
}

@Entity('messages')
export class Message extends BaseEntity {
  @ManyToOne(() => User, (user) => user.sentMessages, { eager: true })
  sender: User;

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  chat: Chat;

  @Column('text', { nullable: true })
  text?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column('jsonb', { default: [] })
  attachments: MessageAttachment[];

  @Column('jsonb', { default: [] })
  quickReplies: string[];

  @Column('jsonb', { default: [] })
  readReceipts: MessageReadReceipt[];

  @ManyToOne(() => Product, (product) => product.messageContexts, { nullable: true, eager: true, onDelete: 'SET NULL' })
  productContext?: Product;
}
