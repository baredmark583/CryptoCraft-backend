import { WorkshopService } from './workshop.service';
import { CreateWorkshopPostDto } from './dto/create-workshop-post.dto';
import { CreateWorkshopCommentDto } from './dto/create-workshop-comment.dto';
import { ReportWorkshopContentDto } from './dto/report-workshop-content.dto';
import { ModerateWorkshopContentDto } from './dto/moderate-workshop-content.dto';
export declare class WorkshopController {
    private readonly workshopService;
    constructor(workshopService: WorkshopService);
    createPost(req: any, createPostDto: CreateWorkshopPostDto): Promise<import("./entities/workshop-post.entity").WorkshopPost>;
    getPostsBySeller(sellerId: string): Promise<import("./entities/workshop-post.entity").WorkshopPost[]>;
    getFeed(req: any): Promise<{
        items: {
            post: import("./entities/workshop-post.entity").WorkshopPost;
            seller: import("../users/entities/user.entity").User;
        }[];
        isDiscovery: boolean;
    }>;
    likePost(req: any, postId: string): Promise<void>;
    addComment(req: any, postId: string, createCommentDto: CreateWorkshopCommentDto): Promise<import("./entities/workshop-comment.entity").WorkshopComment>;
    reportPost(req: any, postId: string, dto: ReportWorkshopContentDto): Promise<void>;
    reportComment(req: any, commentId: string, dto: ReportWorkshopContentDto): Promise<void>;
    listFlaggedPosts(limit?: string, offset?: string): Promise<[import("./entities/workshop-post.entity").WorkshopPost[], number]>;
    listFlaggedComments(limit?: string, offset?: string): Promise<[import("./entities/workshop-comment.entity").WorkshopComment[], number]>;
    moderatePost(req: any, postId: string, dto: ModerateWorkshopContentDto): Promise<void>;
    moderateComment(commentId: string, dto: ModerateWorkshopContentDto): Promise<void>;
}
