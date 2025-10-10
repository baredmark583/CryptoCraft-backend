import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { WorkshopPost } from './workshop-post.entity';

@Entity('workshop_comments')
export class WorkshopComment extends BaseEntity {
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  author: User;

  @Column('text')
  text: string;

  @ManyToOne(() => WorkshopPost, (post) => post.comments, { onDelete: 'CASCADE' })
  post: WorkshopPost;
}