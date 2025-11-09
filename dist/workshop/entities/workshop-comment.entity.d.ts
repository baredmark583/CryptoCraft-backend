import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { WorkshopPost } from './workshop-post.entity';
export type WorkshopCommentStatus = 'VISIBLE' | 'HIDDEN';
export declare class WorkshopComment extends BaseEntity {
    author: User;
    text: string;
    post: WorkshopPost;
    status: WorkshopCommentStatus;
    reportCount: number;
    reportReasons: {
        reason: string;
        reporterId: string;
        reportedAt: string;
    }[];
    lastReportedAt?: Date;
}
