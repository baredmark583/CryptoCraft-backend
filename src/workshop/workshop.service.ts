import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Not } from 'typeorm';
import { WorkshopPost } from './entities/workshop-post.entity';
import { User } from '../users/entities/user.entity';
import { CreateWorkshopPostDto } from './dto/create-workshop-post.dto';
import { CreateWorkshopCommentDto } from './dto/create-workshop-comment.dto';
import { WorkshopComment } from './entities/workshop-comment.entity';

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

    const post = this.postRepository.create({
      ...createDto,
      seller,
      likedBy: [],
      comments: [],
    });

    return this.postRepository.save(post);
  }

  async getPostsBySellerId(sellerId: string): Promise<WorkshopPost[]> {
    return this.postRepository.find({
      where: { seller: { id: sellerId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getFeedForUser(userId: string): Promise<{ items: { post: WorkshopPost, seller: User }[], isDiscovery: boolean }> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const followingIds = user.following.length > 0 ? user.following : [userId]; 

    const posts = await this.postRepository.find({
      where: { seller: { id: In(followingIds) } },
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
      where: { seller: { id: Not(In([userId])) } }, // Exclude own posts
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
    
    const comment = this.commentRepository.create({
      ...createDto,
      author,
      post,
    });

    return this.commentRepository.save(comment);
  }
}