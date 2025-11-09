import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
export interface ReviewMediaAttachment {
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string;
    name?: string;
    mimeType?: string;
    size?: number;
}
export interface ReviewBehaviorSignal {
    code: string;
    weight: number;
    detail?: string;
    triggeredAt: string;
}
export declare class Review extends BaseEntity {
    product: Product;
    productId: string;
    author: User;
    rating: number;
    text?: string;
    attachments: ReviewMediaAttachment[];
    imageUrl?: string;
    sourceOrderId?: string;
    sourceOrderItemId?: string;
    verifiedDeliveryAt?: Date;
    behaviorSignals: ReviewBehaviorSignal[];
    fraudScore: number;
    isHidden: boolean;
    moderationFlags: string[];
}
