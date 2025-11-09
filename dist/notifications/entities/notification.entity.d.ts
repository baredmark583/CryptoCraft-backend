import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
export type NotificationType = 'new_message' | 'sale' | 'new_review' | 'outbid' | 'auction_won' | 'auction_ended_seller' | 'new_dispute_seller' | 'new_listing_from_followed' | 'personal_offer';
export declare class Notification extends BaseEntity {
    user: User;
    type: NotificationType;
    text: string;
    link: string;
    read: boolean;
}
