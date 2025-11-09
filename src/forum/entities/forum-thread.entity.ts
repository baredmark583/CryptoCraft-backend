import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { ForumPost } from './forum-post.entity';

@Entity('forum_threads')
export class ForumThread extends BaseEntity {
  @Column()
  title: string;

  @ManyToOne(() => User, (user) => user.forumThreads, { eager: true, onDelete: 'CASCADE' })
  author: User;

  @OneToMany(() => ForumPost, (post) => post.thread)
  posts: ForumPost[];

  @Column({ default: 0 })
  replyCount: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastReplyAt: Date;

  @Column({ default: false })
  isPinned: boolean;

  @Column({
    type: 'enum',
    enum: ['OPEN', 'LOCKED'],
    default: 'OPEN',
  })
  status: 'OPEN' | 'LOCKED';

  @Column('text', { array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  viewCount: number;
}
