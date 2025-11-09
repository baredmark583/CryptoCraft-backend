import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumThread } from './entities/forum-thread.entity';
import { ForumPost } from './entities/forum-post.entity';
import { User } from '../users/entities/user.entity';
import { CreateForumThreadDto } from './dto/create-forum-thread.dto';
import { CreateForumPostDto } from './dto/create-forum-post.dto';
import { PinThreadDto } from './dto/pin-thread.dto';
import { UpdateThreadModerationDto } from './dto/update-thread-moderation.dto';
import { ReportForumPostDto } from './dto/report-forum-post.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class ForumService {
  constructor(
    @InjectRepository(ForumThread)
    private readonly threadRepository: Repository<ForumThread>,
    @InjectRepository(ForumPost)
    private readonly postRepository: Repository<ForumPost>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createThread(authorId: string, createDto: CreateForumThreadDto): Promise<ForumThread> {
    const author = await this.userRepository.findOneBy({ id: authorId });
    if (!author) throw new NotFoundException('Author not found');

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

  async createPost(authorId: string, threadId: string, createDto: CreateForumPostDto): Promise<ForumPost> {
    const author = await this.userRepository.findOneBy({ id: authorId });
    if (!author) throw new NotFoundException('Author not found');

    const thread = await this.threadRepository.findOneBy({ id: threadId });
    if (!thread) throw new NotFoundException('Thread not found');
    if (thread.status === 'LOCKED') {
      throw new ForbiddenException('Thread is locked by moderators');
    }

    const post = this.postRepository.create({
      content: this.sanitize(createDto.content),
      author,
      thread,
    });
    const savedPost = await this.postRepository.save(post);

    // Update thread metadata
    thread.replyCount += 1;
    thread.lastReplyAt = savedPost.createdAt;
    await this.threadRepository.save(thread);

    return savedPost;
  }

  private sanitize(html?: string): string | undefined {
    if (!html) return html;
    let out = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    out = out.replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, '');
    out = out.replace(/ on[a-z]+\s*=\s*'[^']*'/gi, '');
    out = out.replace(/ on[a-z]+\s*=\s*[^\s>]+/gi, '');
    return out;
  }

  async findAllThreads(options: {
    page?: number;
    limit?: number;
    search?: string;
    tag?: string;
    pinnedOnly?: boolean;
  }): Promise<{ data: ForumThread[]; total: number }> {
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

  async findThreadById(id: string): Promise<ForumThread> {
    const thread = await this.threadRepository.findOne({ where: { id }, relations: ['author'] });
    if (!thread) throw new NotFoundException('Thread not found');
    thread.viewCount += 1;
    await this.threadRepository.save(thread);
    return thread;
  }

  async findPostsByThreadId(threadId: string, page = 1, limit = 25): Promise<{ data: ForumPost[]; total: number }> {
    const [data, total] = await this.postRepository.findAndCount({
      where: { thread: { id: threadId }, isHidden: false },
      order: { createdAt: 'ASC' },
      relations: ['author'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async pinThread(threadId: string, dto: PinThreadDto): Promise<ForumThread> {
    const thread = await this.threadRepository.findOneBy({ id: threadId });
    if (!thread) throw new NotFoundException('Thread not found');
    thread.isPinned = dto.isPinned;
    return this.threadRepository.save(thread);
  }

  async updateThreadStatus(threadId: string, dto: UpdateThreadModerationDto): Promise<ForumThread> {
    const thread = await this.threadRepository.findOneBy({ id: threadId });
    if (!thread) throw new NotFoundException('Thread not found');
    thread.status = dto.status;
    return this.threadRepository.save(thread);
  }

  async reportPost(postId: string, reporterId: string, dto: ReportForumPostDto): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['author', 'thread'],
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.author.id === reporterId) {
      throw new ForbiddenException('You cannot report your own post');
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
}
