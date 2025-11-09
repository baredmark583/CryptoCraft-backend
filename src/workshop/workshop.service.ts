import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Not } from 'typeorm';
import { WorkshopPost } from './entities/workshop-post.entity';
import { User } from '../users/entities/user.entity';
import { CreateWorkshopPostDto } from './dto/create-workshop-post.dto';
import { CreateWorkshopCommentDto } from './dto/create-workshop-comment.dto';
import { WorkshopComment } from './entities/workshop-comment.entity';
import { ReportWorkshopContentDto } from './dto/report-workshop-content.dto';
import { ModerateWorkshopContentDto } from './dto/moderate-workshop-content.dto';

@Injectable()
export class WorkshopService {
  constructor(
    @InjectRepository(WorkshopPost)
    private readonly postRepository: Repository<WorkshopPost>,
    @InjectRepository(WorkshopComment)
    private readonly commentRepository: Repository<WorkshopComment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createPost(sellerId: string, createDto: CreateWorkshopPostDto): Promise<WorkshopPost> {
    const seller = await this.userRepository.findOneBy({ id: sellerId });
    if (!seller) throw new NotFoundException('Seller not found');

    if (createDto.imageUrl) this.validateUrl(createDto.imageUrl);

    const post = this.postRepository.create({
      ...createDto,
      seller,
      likedBy: [],
      comments: [],
      status: 'PUBLISHED',
    });

    return this.postRepository.save(post);
  }

  async getPostsBySellerId(sellerId: string): Promise<WorkshopPost[]> {
    return this.postRepository.find({
      where: { seller: { id: sellerId }, status: Not('HIDDEN') },
      order: { createdAt: 'DESC' },
    });
  }

  async getFeedForUser(userId: string): Promise<{ items: { post: WorkshopPost, seller: User }[], isDiscovery: boolean }> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const followingIds = user.following.length > 0 ? user.following : [userId]; 

    const posts = await this.postRepository.find({
      where: {
        seller: { id: In(followingIds) },
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

    // Discovery mode: show popular posts if the user's feed is empty
    const discoveryPosts = await this.postRepository.find({
      where: {
        seller: { id: Not(In([userId])) },
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

  async likePost(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findOne({ where: {id: postId}, relations: ['likedBy']});
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!post || !user) throw new NotFoundException('Post or User not found');
    if (post.status !== 'PUBLISHED') {
      throw new ForbiddenException('Post is not available for interactions');
    }

    const isLiked = post.likedBy.some(u => u.id === userId);

    if (isLiked) {
      post.likedBy = post.likedBy.filter(u => u.id !== userId);
    } else {
      post.likedBy.push(user);
    }

    await this.postRepository.save(post);
  }

  async addComment(postId: string, authorId: string, createDto: CreateWorkshopCommentDto): Promise<WorkshopComment> {
    const post = await this.postRepository.findOneBy({ id: postId });
    const author = await this.userRepository.findOneBy({ id: authorId });

    if (!post || !author) throw new NotFoundException('Post or Author not found');
    if (post.commentsLocked || post.status !== 'PUBLISHED') {
      throw new ForbiddenException('Comments are disabled for this post');
    }
    
    const comment = this.commentRepository.create({
      ...createDto,
      author,
      post,
      status: 'VISIBLE',
    });

    return this.commentRepository.save(comment);
  }

  async reportPost(postId: string, reporterId: string, dto: ReportWorkshopContentDto): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId }, relations: ['seller'] });
    if (!post) throw new NotFoundException('Post not found');
    if (post.seller.id === reporterId) {
      throw new ForbiddenException('You cannot report your own post');
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

  async reportComment(commentId: string, reporterId: string, dto: ReportWorkshopContentDto): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['author', 'post'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.id === reporterId) {
      throw new ForbiddenException('You cannot report your own comment');
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

  async listFlaggedPosts(limit = 20, offset = 0): Promise<[WorkshopPost[], number]> {
    return this.postRepository.findAndCount({
      where: { status: In(['FLAGGED', 'HIDDEN']) },
      relations: ['seller'],
      take: limit,
      skip: offset,
      order: { lastReportedAt: 'DESC' },
    });
  }

  async listFlaggedComments(limit = 20, offset = 0): Promise<[WorkshopComment[], number]> {
    return this.commentRepository.findAndCount({
      where: { status: 'HIDDEN' },
      relations: ['author', 'post'],
      take: limit,
      skip: offset,
      order: { lastReportedAt: 'DESC' },
    });
  }

  async moderatePost(postId: string, dto: ModerateWorkshopContentDto, moderatorId: string): Promise<void> {
    const post = await this.postRepository.findOne({ where: { id: postId }, relations: ['seller'] });
    if (!post) throw new NotFoundException('Post not found');
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

  async moderateComment(commentId: string, dto: ModerateWorkshopContentDto): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');

    if (dto.action === 'DELETE') {
      await this.commentRepository.delete(commentId);
      return;
    }

    if (dto.action === 'APPROVE') {
      comment.status = 'VISIBLE';
      comment.reportCount = 0;
    } else {
      comment.status = 'HIDDEN';
    }

    await this.commentRepository.save(comment);
  }

  private validateUrl(value?: string) {
    if (!value) return;
    try {
      const u = new URL(value);
      if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Invalid protocol');
    } catch {
      throw new BadRequestException('Invalid URL');
    }
  }
}
