import { Entity, Column, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';
import { DecimalTransformer } from '../../database/base.entity';
import { Chat } from '../../chats/entities/chat.entity';
import { Message } from '../../chats/entities/message.entity';

// Define jsonb types directly here as they are simple
export interface ShippingAddress {
  city: string;
  postOffice: string;
  recipientName: string;
  phoneNumber: string;
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
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({
    type: 'bigint',
    unique: true,
    nullable: true,
    transformer: {
      from: (val: string | null) => (val ? parseInt(val, 10) : null),
      to: (val: number | null) => val,
    },
  })
  telegramId?: number;

  @Column()
  name: string;
  
  @Column({ unique: true, nullable: true })
  email?: string;

  @Column()
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
  
  @Column('simple-array', { default: '' })
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
    enum: ['NONE', 'PRO'],
    default: 'NONE',
  })
  verificationLevel: 'NONE' | 'PRO';
  
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @Column({ nullable: true })
  affiliateId?: string;

  @Column({ nullable: true })
  phoneNumber?: string;
  
  @Column('jsonb', { nullable: true })
  defaultShippingAddress?: ShippingAddress;
  
  @Column('jsonb', { nullable: true })
  businessInfo?: BusinessInfo;
  
  @Column({ nullable: true, unique: true })
  tonWalletAddress?: string;

  @Column({ nullable: true })
  paymentCard?: string;

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  @OneToMany(() => Order, (order) => order.buyer)
  purchases: Order[];

  @OneToMany(() => Order, (order) => order.seller)
  sales: Order[];

  @ManyToMany(() => Chat, (chat) => chat.participants)
  chats: Chat[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}