import { Repository } from 'typeorm';
import { ForumThread } from './entities/forum-thread.entity';
import { ForumPost } from './entities/forum-post.entity';
import { User } from '../users/entities/user.entity';
import { CreateForumThreadDto } from './dto/create-forum-thread.dto';
import { CreateForumPostDto } from './dto/create-forum-post.dto';
import { PinThreadDto } from './dto/pin-thread.dto';
import { UpdateThreadModerationDto } from './dto/update-thread-moderation.dto';
import { ReportForumPostDto } from './dto/report-forum-post.dto';
export declare class ForumService {
    private readonly threadRepository;
    private readonly postRepository;
    private readonly userRepository;
    constructor(threadRepository: Repository<ForumThread>, postRepository: Repository<ForumPost>, userRepository: Repository<User>);
    createThread(authorId: string, createDto: CreateForumThreadDto): Promise<ForumThread>;
    createPost(authorId: string, threadId: string, createDto: CreateForumPostDto): Promise<ForumPost>;
    private sanitize;
    findAllThreads(options: {
        page?: number;
        limit?: number;
        search?: string;
        tag?: string;
        pinnedOnly?: boolean;
    }): Promise<{
        data: ForumThread[];
        total: number;
    }>;
    findThreadById(id: string): Promise<ForumThread>;
    findPostsByThreadId(threadId: string, page?: number, limit?: number): Promise<{
        data: ForumPost[];
        total: number;
    }>;
    pinThread(threadId: string, dto: PinThreadDto): Promise<ForumThread>;
    updateThreadStatus(threadId: string, dto: UpdateThreadModerationDto): Promise<ForumThread>;
    reportPost(postId: string, reporterId: string, dto: ReportForumPostDto): Promise<void>;
}
