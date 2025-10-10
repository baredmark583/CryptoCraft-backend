import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Proposal } from './proposal.entity';

export type VoteChoice = 'FOR' | 'AGAINST';

@Entity('votes')
export class Vote extends BaseEntity {
  @ManyToOne(() => User, { eager: true })
  voter: User;

  @ManyToOne(() => Proposal, (proposal) => proposal.votes, { onDelete: 'CASCADE' })
  proposal: Proposal;

  @Column({ type: 'enum', enum: ['FOR', 'AGAINST'] })
  choice: VoteChoice;
}
