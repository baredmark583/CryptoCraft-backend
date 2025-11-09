import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { WorkshopComment } from './workshop-comment.entity';
export type WorkshopPostStatus = 'PUBLISHED' | 'FLAGGED' | 'HIDDEN';
export declare class WorkshopPost extends BaseEntity {
    seller: User;
    text: string;
    imageUrl?: string;
    likedBy: User[];
    comments: WorkshopComment[];
    status: WorkshopPostStatus;
    reportCount: number;
    reportReasons: {
        reason: string;
        reporterId: string;
        reportedAt: string;
    }[];
    lastReportedAt?: Date;
    moderationNotes?: string;
    commentsLocked: boolean;
}
