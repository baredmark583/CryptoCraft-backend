import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
export declare class Livestream extends BaseEntity {
    title: string;
    seller: User;
    status: 'UPCOMING' | 'LIVE' | 'ENDED';
    featuredProduct: Product;
    scheduledStartTime?: number;
    moderatorId?: string;
    isAiModeratorEnabled?: boolean;
    welcomeMessage?: string;
    likes: number;
    viewerCount: number;
    isPromoted: boolean;
    peakViewers: number;
    totalViewerMinutes: number;
    recordingUrl?: string;
    abuseStrikes: number;
    abuseReports: {
        reason: string;
        reporterId?: string;
        reportedAt: string;
    }[];
    lastAnalyticsAt?: Date;
}
