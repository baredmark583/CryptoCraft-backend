import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { WorkshopPost } from './workshop-post.entity';

export type WorkshopCommentStatus = 'VISIBLE' | 'HIDDEN';

@Entity('workshop_comments')
export class WorkshopComment extends BaseEntity {
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  author: User;

  @Column('text')
  text: string;

  @ManyToOne(() => WorkshopPost, (post) => post.comments, { onDelete: 'CASCADE' })
  post: WorkshopPost;

  @Column({
    type: 'enum',
    enum: ['VISIBLE', 'HIDDEN'],
    default: 'VISIBLE',
  })
  status: WorkshopCommentStatus;

  @Column({ type: 'int', default: 0 })
  reportCount: number;

  @Column('jsonb', { default: [] })
  reportReasons: { reason: string; reporterId: string; reportedAt: string }[];

  @Column({ type: 'timestamptz', nullable: true })
  lastReportedAt?: Date;
}
