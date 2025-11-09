import { Entity, Column, OneToMany, ManyToMany } from 'typeorm';
import { BaseEntity, DecimalTransformer } from '../../database/base.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Chat } from '../../chats/entities/chat.entity';
import { Message } from '../../chats/entities/message.entity';
import { Collection } from '../../collections/entities/collection.entity';
import { WorkshopPost } from '../../workshop/entities/workshop-post.entity';
import { ForumThread } from '../../forum/entities/forum-thread.entity';
import { ForumPost } from '../../forum/entities/forum-post.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { PromoCode } from '../../promocodes/entities/promocode.entity';

export interface ShippingAddress {
  city: string;
  postOffice?: string;
  recipientName?: string;
  phoneNumber?: string;
  cityRef?: string;
  warehouseRef?: string;
}

export interface BusinessInfo {
  registrationNumber: string;
}

export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'bigint', unique: true, nullable: true })
  telegramId: number;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ default: 'default_avatar_url' })
  avatarUrl: string;

  @Column({ nullable: true })
  headerImageUrl?: string;

  @Column('decimal', {
    precision: 2,
    scale: 1,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  rating: number;

  @Column('simple-array', { default: [] })
  following: string[];

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  balance: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new DecimalTransformer(),
  })
  commissionOwed: number;
  
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true, unique: true })
  affiliateId?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column('jsonb', { nullable: true })
  defaultShippingAddress?: ShippingAddress;

  @Column('jsonb', { nullable: true })
  businessInfo?: BusinessInfo;

  @Column({ nullable: true })
  tonWalletAddress?: string;

  @Column({ nullable: true })
  paymentCard?: string;

  @Column({
    type: 'enum',
    enum: ['NONE', 'PRO'],
    default: 'NONE',
  })
  verificationLevel: 'NONE' | 'PRO';

  @Column({ type: 'timestamptz', nullable: true })
  proGrantedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastProReviewAt?: Date;
  
  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  @OneToMany(() => Order, (order) => order.buyer)
  purchases: Order[];

  @OneToMany(() => Order, (order) => order.seller)
  sales: Order[];
  
  @OneToMany(() => Review, (review) => review.author)
  reviews: Review[];
  
  @ManyToMany(() => Chat, (chat) => chat.participants)
  chats: Chat[];
  
  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Collection, (collection) => collection.user)
  collections: Collection[];

  @OneToMany(() => WorkshopPost, (post) => post.seller)
  workshopPosts: WorkshopPost[];
  
  @OneToMany(() => ForumThread, (thread) => thread.author)
  forumThreads: ForumThread[];
  
  @OneToMany(() => ForumPost, (post) => post.author)
  forumPosts: ForumPost[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => PromoCode, (promoCode) => promoCode.seller)
  promoCodes: PromoCode[];
}
