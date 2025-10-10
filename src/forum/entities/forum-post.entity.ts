import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { ForumThread } from './forum-thread.entity';

@Entity('forum_posts')
export class ForumPost extends BaseEntity {
  @ManyToOne(() => ForumThread, (thread) => thread.posts, { onDelete: 'CASCADE' })
  thread: ForumThread;

  @ManyToOne(() => User, (user) => user.forumPosts, { eager: true, onDelete: 'CASCADE' })
  author: User;

  @Column('text')
  content: string;
}