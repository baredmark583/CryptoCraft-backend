import { Repository } from 'typeorm';
import { WorkshopPost } from './entities/workshop-post.entity';
import { User } from '../users/entities/user.entity';
import { CreateWorkshopPostDto } from './dto/create-workshop-post.dto';
import { CreateWorkshopCommentDto } from './dto/create-workshop-comment.dto';
import { WorkshopComment } from './entities/workshop-comment.entity';
import { ReportWorkshopContentDto } from './dto/report-workshop-content.dto';
import { ModerateWorkshopContentDto } from './dto/moderate-workshop-content.dto';
export declare class WorkshopService {
    private readonly postRepository;
    private readonly commentRepository;
    private readonly userRepository;
    constructor(postRepository: Repository<WorkshopPost>, commentRepository: Repository<WorkshopComment>, userRepository: Repository<User>);
    createPost(sellerId: string, createDto: CreateWorkshopPostDto): Promise<WorkshopPost>;
    getPostsBySellerId(sellerId: string): Promise<WorkshopPost[]>;
    getFeedForUser(userId: string): Promise<{
        items: {
            post: WorkshopPost;
            seller: User;
        }[];
        isDiscovery: boolean;
    }>;
    likePost(postId: string, userId: string): Promise<void>;
    addComment(postId: string, authorId: string, createDto: CreateWorkshopCommentDto): Promise<WorkshopComment>;
    reportPost(postId: string, reporterId: string, dto: ReportWorkshopContentDto): Promise<void>;
    reportComment(commentId: string, reporterId: string, dto: ReportWorkshopContentDto): Promise<void>;
    listFlaggedPosts(limit?: number, offset?: number): Promise<[WorkshopPost[], number]>;
    listFlaggedComments(limit?: number, offset?: number): Promise<[WorkshopComment[], number]>;
    moderatePost(postId: string, dto: ModerateWorkshopContentDto, moderatorId: string): Promise<void>;
    moderateComment(commentId: string, dto: ModerateWorkshopContentDto): Promise<void>;
    private validateUrl;
}
