import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { ForumThread } from './forum-thread.entity';
export declare class ForumPost extends BaseEntity {
    thread: ForumThread;
    author: User;
    content: string;
    isHidden: boolean;
    reportCount: number;
    reportReasons: {
        reason: string;
        reporterId: string;
        reportedAt: string;
    }[];
}
