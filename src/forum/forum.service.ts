import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumThread } from './entities/forum-thread.entity';
import { ForumPost } from './entities/forum-post.entity';
import { User } from '../users/entities/user.entity';
import { CreateForumThreadDto } from './dto/create-forum-thread.dto';
import { CreateForumPostDto } from './dto/create-forum-post.dto';

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
    });
    const savedThread = await this.threadRepository.save(thread);

    const firstPost = this.postRepository.create({
      content: createDto.content,
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

    const post = this.postRepository.create({
      content: createDto.content,
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

  findAllThreads(): Promise<ForumThread[]> {
    return this.threadRepository.find({
      order: { isPinned: 'DESC', lastReplyAt: 'DESC' },
      relations: ['author'],
    });
  }

  async findThreadById(id: string): Promise<ForumThread> {
    const thread = await this.threadRepository.findOne({ where: { id }, relations: ['author'] });
    if (!thread) throw new NotFoundException('Thread not found');
    return thread;
  }

  findPostsByThreadId(threadId: string): Promise<ForumPost[]> {
    return this.postRepository.find({
      where: { thread: { id: threadId } },
      order: { createdAt: 'ASC' },
      relations: ['author'],
    });
  }
}