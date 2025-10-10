import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Vote } from './vote.entity';

export type ProposalStatus = 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXECUTED';

@Entity('proposals')
export class Proposal extends BaseEntity {
  @Column()
  title: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User, { eager: true })
  proposer: User;

  @Column({ type: 'bigint' })
  endsAt: number;

  @Column({ type: 'enum', enum: ['ACTIVE', 'PASSED', 'REJECTED', 'EXECUTED'], default: 'ACTIVE' })
  status: ProposalStatus;

  @OneToMany(() => Vote, (vote) => vote.proposal, { cascade: true })
  votes: Vote[];
}
