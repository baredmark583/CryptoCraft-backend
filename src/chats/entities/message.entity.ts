import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Chat } from './chat.entity';
import { Product } from '../../products/entities/product.entity';

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

  @ManyToOne(() => Product, (product) => product.messageContexts, { nullable: true, eager: true, onDelete: 'SET NULL' })
  productContext?: Product;
}
