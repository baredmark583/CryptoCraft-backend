import { Entity, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { WorkshopComment } from './workshop-comment.entity';

export type WorkshopPostStatus = 'PUBLISHED' | 'FLAGGED' | 'HIDDEN';

@Entity('workshop_posts')
export class WorkshopPost extends BaseEntity {
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  seller: User;

  @Column('text')
  text: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @ManyToMany(() => User, { eager: true, cascade: true })
  @JoinTable()
  likedBy: User[];

  @OneToMany(() => WorkshopComment, (comment) => comment.post, { cascade: true, eager: true })
  comments: WorkshopComment[];

  @Column({
    type: 'enum',
    enum: ['PUBLISHED', 'FLAGGED', 'HIDDEN'],
    default: 'PUBLISHED',
  })
  status: WorkshopPostStatus;

  @Column({ type: 'int', default: 0 })
  reportCount: number;

  @Column('jsonb', { default: [] })
  reportReasons: { reason: string; reporterId: string; reportedAt: string }[];

  @Column({ type: 'timestamptz', nullable: true })
  lastReportedAt?: Date;

  @Column({ nullable: true })
  moderationNotes?: string;

  @Column({ default: false })
  commentsLocked: boolean;
}
