import { ForumService } from './forum.service';
import { CreateForumThreadDto } from './dto/create-forum-thread.dto';
import { CreateForumPostDto } from './dto/create-forum-post.dto';
import { PinThreadDto } from './dto/pin-thread.dto';
import { UpdateThreadModerationDto } from './dto/update-thread-moderation.dto';
import { ReportForumPostDto } from './dto/report-forum-post.dto';
export declare class ForumController {
    private readonly forumService;
    constructor(forumService: ForumService);
    createThread(req: any, createDto: CreateForumThreadDto): Promise<import("./entities/forum-thread.entity").ForumThread>;
    getAllThreads(page?: string, limit?: string, search?: string, tag?: string, pinnedOnly?: string): Promise<{
        data: import("./entities/forum-thread.entity").ForumThread[];
        total: number;
    }>;
    getThreadById(id: string): Promise<import("./entities/forum-thread.entity").ForumThread>;
    getPostsByThreadId(id: string, page?: string, limit?: string): Promise<{
        data: import("./entities/forum-post.entity").ForumPost[];
        total: number;
    }>;
    createPost(req: any, id: string, createDto: CreateForumPostDto): Promise<import("./entities/forum-post.entity").ForumPost>;
    pinThread(id: string, dto: PinThreadDto): Promise<import("./entities/forum-thread.entity").ForumThread>;
    updateThreadStatus(id: string, dto: UpdateThreadModerationDto): Promise<import("./entities/forum-thread.entity").ForumThread>;
    reportPost(req: any, postId: string, dto: ReportForumPostDto): Promise<void>;
}
