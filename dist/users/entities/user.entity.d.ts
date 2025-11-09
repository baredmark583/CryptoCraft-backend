import { BaseEntity } from '../../database/base.entity';
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
export declare enum UserRole {
    USER = "USER",
    MODERATOR = "MODERATOR",
    SUPER_ADMIN = "SUPER_ADMIN"
}
export declare class User extends BaseEntity {
    telegramId: number;
    name: string;
    email?: string;
    avatarUrl: string;
    headerImageUrl?: string;
    rating: number;
    following: string[];
    balance: number;
    commissionOwed: number;
    role: UserRole;
    affiliateId?: string;
    phoneNumber?: string;
    defaultShippingAddress?: ShippingAddress;
    businessInfo?: BusinessInfo;
    tonWalletAddress?: string;
    paymentCard?: string;
    verificationLevel: 'NONE' | 'PRO';
    proGrantedAt?: Date;
    lastProReviewAt?: Date;
    products: Product[];
    purchases: Order[];
    sales: Order[];
    reviews: Review[];
    chats: Chat[];
    sentMessages: Message[];
    collections: Collection[];
    workshopPosts: WorkshopPost[];
    forumThreads: ForumThread[];
    forumPosts: ForumPost[];
    notifications: Notification[];
    promoCodes: PromoCode[];
}
