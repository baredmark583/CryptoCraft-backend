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
export declare class Message extends BaseEntity {
    sender: User;
    chat: Chat;
    text?: string;
    imageUrl?: string;
    attachments: MessageAttachment[];
    quickReplies: string[];
    readReceipts: MessageReadReceipt[];
    productContext?: Product;
}
