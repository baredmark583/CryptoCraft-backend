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
exports.ForumService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const forum_thread_entity_1 = require("./entities/forum-thread.entity");
const forum_post_entity_1 = require("./entities/forum-post.entity");
const user_entity_1 = require("../users/entities/user.entity");
let ForumService = class ForumService {
    constructor(threadRepository, postRepository, userRepository) {
        this.threadRepository = threadRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }
    async createThread(authorId, createDto) {
        const author = await this.userRepository.findOneBy({ id: authorId });
        if (!author)
            throw new common_1.NotFoundException('Author not found');
        const thread = this.threadRepository.create({
            title: createDto.title,
            author,
            replyCount: 0,
            lastReplyAt: new Date(),
            tags: (createDto.tags || []).map((t) => t.trim()).filter(Boolean),
        });
        const savedThread = await this.threadRepository.save(thread);
        const firstPost = this.postRepository.create({
            content: this.sanitize(createDto.content),
            author,
            thread: savedThread,
        });
        await this.postRepository.save(firstPost);
        return this.findThreadById(savedThread.id);
    }
    async createPost(authorId, threadId, createDto) {
        const author = await this.userRepository.findOneBy({ id: authorId });
        if (!author)
            throw new common_1.NotFoundException('Author not found');
        const thread = await this.threadRepository.findOneBy({ id: threadId });
        if (!thread)
            throw new common_1.NotFoundException('Thread not found');
        if (thread.status === 'LOCKED') {
            throw new common_1.ForbiddenException('Thread is locked by moderators');
        }
        const post = this.postRepository.create({
            content: this.sanitize(createDto.content),
            author,
            thread,
        });
        const savedPost = await this.postRepository.save(post);
        thread.replyCount += 1;
        thread.lastReplyAt = savedPost.createdAt;
        await this.threadRepository.save(thread);
        return savedPost;
    }
    sanitize(html) {
        if (!html)
            return html;
        let out = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
        out = out.replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, '');
        out = out.replace(/ on[a-z]+\s*=\s*'[^']*'/gi, '');
        out = out.replace(/ on[a-z]+\s*=\s*[^\s>]+/gi, '');
        return out;
    }
    async findAllThreads(options) {
        const { page = 1, limit = 20, search, tag, pinnedOnly } = options;
        const qb = this.threadRepository
            .createQueryBuilder('thread')
            .leftJoinAndSelect('thread.author', 'author')
            .orderBy('thread.isPinned', 'DESC')
            .addOrderBy('thread.lastReplyAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        if (search) {
            qb.andWhere('thread.title ILIKE :search', { search: `%${search}%` });
        }
        if (tag) {
            qb.andWhere(':tag = ANY(thread.tags)', { tag });
        }
        if (pinnedOnly) {
            qb.andWhere('thread.isPinned = true');
        }
        const [data, total] = await qb.getManyAndCount();
        return { data, total };
    }
    async findThreadById(id) {
        const thread = await this.threadRepository.findOne({ where: { id }, relations: ['author'] });
        if (!thread)
            throw new common_1.NotFoundException('Thread not found');
        thread.viewCount += 1;
        await this.threadRepository.save(thread);
        return thread;
    }
    async findPostsByThreadId(threadId, page = 1, limit = 25) {
        const [data, total] = await this.postRepository.findAndCount({
            where: { thread: { id: threadId }, isHidden: false },
            order: { createdAt: 'ASC' },
            relations: ['author'],
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total };
    }
    async pinThread(threadId, dto) {
        const thread = await this.threadRepository.findOneBy({ id: threadId });
        if (!thread)
            throw new common_1.NotFoundException('Thread not found');
        thread.isPinned = dto.isPinned;
        return this.threadRepository.save(thread);
    }
    async updateThreadStatus(threadId, dto) {
        const thread = await this.threadRepository.findOneBy({ id: threadId });
        if (!thread)
            throw new common_1.NotFoundException('Thread not found');
        thread.status = dto.status;
        return this.threadRepository.save(thread);
    }
    async reportPost(postId, reporterId, dto) {
        const post = await this.postRepository.findOne({
            where: { id: postId },
            relations: ['author', 'thread'],
        });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        if (post.author.id === reporterId) {
            throw new common_1.ForbiddenException('You cannot report your own post');
        }
        post.reportCount += 1;
        post.reportReasons = [
            ...(post.reportReasons || []),
            { reason: dto.reason, reporterId, reportedAt: new Date().toISOString() },
        ];
        if (post.reportCount >= 3) {
            post.isHidden = true;
        }
        await this.postRepository.save(post);
    }
};
exports.ForumService = ForumService;
exports.ForumService = ForumService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(forum_thread_entity_1.ForumThread)),
    __param(1, (0, typeorm_1.InjectRepository)(forum_post_entity_1.ForumPost)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ForumService);
//# sourceMappingURL=forum.service.js.map