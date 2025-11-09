import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { ForumPost } from './forum-post.entity';
export declare class ForumThread extends BaseEntity {
    title: string;
    author: User;
    posts: ForumPost[];
    replyCount: number;
    lastReplyAt: Date;
    isPinned: boolean;
    status: 'OPEN' | 'LOCKED';
    tags: string[];
    viewCount: number;
}
