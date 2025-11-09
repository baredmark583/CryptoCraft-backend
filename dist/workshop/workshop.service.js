"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkshopService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const workshop_post_entity_1 = require("./entities/workshop-post.entity");
const user_entity_1 = require("../users/entities/user.entity");
const workshop_comment_entity_1 = require("./entities/workshop-comment.entity");
let WorkshopService = class WorkshopService {
    constructor(postRepository, commentRepository, userRepository) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }
    async createPost(sellerId, createDto) {
        const seller = await this.userRepository.findOneBy({ id: sellerId });
        if (!seller)
            throw new common_1.NotFoundException('Seller not found');
        if (createDto.imageUrl)
            this.validateUrl(createDto.imageUrl);
        const post = this.postRepository.create({
            ...createDto,
            seller,
            likedBy: [],
            comments: [],
            status: 'PUBLISHED',
        });
        return this.postRepository.save(post);
    }
    async getPostsBySellerId(sellerId) {
        return this.postRepository.find({
            where: { seller: { id: sellerId }, status: (0, typeorm_2.Not)('HIDDEN') },
            order: { createdAt: 'DESC' },
        });
    }
    async getFeedForUser(userId) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const followingIds = user.following.length > 0 ? user.following : [userId];
        const posts = await this.postRepository.find({
            where: {
                seller: { id: (0, typeorm_2.In)(followingIds) },
                status: 'PUBLISHED',
            },
            order: { createdAt: 'DESC' },
            take: 20,
        });
        if (posts.length > 0) {
            return {
                items: posts.map(post => ({ post, seller: post.seller })),
                isDiscovery: false,
            };
        }
        const discoveryPosts = await this.postRepository.find({
            where: {
                seller: { id: (0, typeorm_2.Not)((0, typeorm_2.In)([userId])) },
                status: 'PUBLISHED',
            },
            order: { createdAt: 'DESC' },
            take: 10,
        });
        return {
            items: discoveryPosts.map(post => ({ post, seller: post.seller })),
            isDiscovery: true,
        };
    }
    async likePost(postId, userId) {
        const post = await this.postRepository.findOne({ where: { id: postId }, relations: ['likedBy'] });
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!post || !user)
            throw new common_1.NotFoundException('Post or User not found');
        if (post.status !== 'PUBLISHED') {
            throw new common_1.ForbiddenException('Post is not available for interactions');
        }
        const isLiked = post.likedBy.some(u => u.id === userId);
        if (isLiked) {
            post.likedBy = post.likedBy.filter(u => u.id !== userId);
        }
        else {
            post.likedBy.push(user);
        }
        await this.postRepository.save(post);
    }
    async addComment(postId, authorId, createDto) {
        const post = await this.postRepository.findOneBy({ id: postId });
        const author = await this.userRepository.findOneBy({ id: authorId });
        if (!post || !author)
            throw new common_1.NotFoundException('Post or Author not found');
        if (post.commentsLocked || post.status !== 'PUBLISHED') {
            throw new common_1.ForbiddenException('Comments are disabled for this post');
        }
        const comment = this.commentRepository.create({
            ...createDto,
            author,
            post,
            status: 'VISIBLE',
        });
        return this.commentRepository.save(comment);
    }
    async reportPost(postId, reporterId, dto) {
        const post = await this.postRepository.findOne({ where: { id: postId }, relations: ['seller'] });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        if (post.seller.id === reporterId) {
            throw new common_1.ForbiddenException('You cannot report your own post');
        }
        const now = new Date();
        post.reportCount += 1;
        post.lastReportedAt = now;
        post.reportReasons = [
            ...(post.reportReasons || []),
            { reason: dto.reason, reporterId, reportedAt: now.toISOString() },
        ];
        if (post.reportCount >= 3 && post.status === 'PUBLISHED') {
            post.status = 'FLAGGED';
        }
        await this.postRepository.save(post);
    }
    async reportComment(commentId, reporterId, dto) {
        const comment = await this.commentRepository.findOne({
            where: { id: commentId },
            relations: ['author', 'post'],
        });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        if (comment.author.id === reporterId) {
            throw new common_1.ForbiddenException('You cannot report your own comment');
        }
        const now = new Date();
        comment.reportCount += 1;
        comment.lastReportedAt = now;
        comment.reportReasons = [
            ...(comment.reportReasons || []),
            { reason: dto.reason, reporterId, reportedAt: now.toISOString() },
        ];
        if (comment.reportCount >= 3 && comment.status === 'VISIBLE') {
            comment.status = 'HIDDEN';
        }
        await this.commentRepository.save(comment);
    }
    async listFlaggedPosts(limit = 20, offset = 0) {
        return this.postRepository.findAndCount({
            where: { status: (0, typeorm_2.In)(['FLAGGED', 'HIDDEN']) },
            relations: ['seller'],
            take: limit,
            skip: offset,
            order: { lastReportedAt: 'DESC' },
        });
    }
    async listFlaggedComments(limit = 20, offset = 0) {
        return this.commentRepository.findAndCount({
            where: { status: 'HIDDEN' },
            relations: ['author', 'post'],
            take: limit,
            skip: offset,
            order: { lastReportedAt: 'DESC' },
        });
    }
    async moderatePost(postId, dto, moderatorId) {
        const post = await this.postRepository.findOne({ where: { id: postId }, relations: ['seller'] });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const moderator = await this.userRepository.findOneBy({ id: moderatorId });
        switch (dto.action) {
            case 'APPROVE':
                post.status = 'PUBLISHED';
                post.reportCount = 0;
                post.moderationNotes = dto.notes || null;
                break;
            case 'HIDE':
                post.status = 'HIDDEN';
                post.moderationNotes = dto.notes || (moderator ? `Hidden by ${moderator.name}` : undefined);
                break;
            case 'DELETE':
                await this.postRepository.delete(postId);
                return;
            case 'LOCK_COMMENTS':
                post.commentsLocked = true;
                break;
            case 'UNLOCK_COMMENTS':
                post.commentsLocked = false;
                break;
        }
        await this.postRepository.save(post);
    }
    async moderateComment(commentId, dto) {
        const comment = await this.commentRepository.findOne({ where: { id: commentId } });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        if (dto.action === 'DELETE') {
            await this.commentRepository.delete(commentId);
            return;
        }
        if (dto.action === 'APPROVE') {
            comment.status = 'VISIBLE';
            comment.reportCount = 0;
        }
        else {
            comment.status = 'HIDDEN';
        }
        await this.commentRepository.save(comment);
    }
    validateUrl(value) {
        if (!value)
            return;
        try {
            const u = new URL(value);
            if (!['http:', 'https:'].includes(u.protocol))
                throw new Error('Invalid protocol');
        }
        catch {
            throw new common_1.BadRequestException('Invalid URL');
        }
    }
};
exports.WorkshopService = WorkshopService;
exports.WorkshopService = WorkshopService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(workshop_post_entity_1.WorkshopPost)),
    __param(1, (0, typeorm_1.InjectRepository)(workshop_comment_entity_1.WorkshopComment)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], WorkshopService);
//# sourceMappingURL=workshop.service.js.map