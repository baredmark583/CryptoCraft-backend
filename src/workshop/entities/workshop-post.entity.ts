import { Entity, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { WorkshopComment } from './workshop-comment.entity';

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
}