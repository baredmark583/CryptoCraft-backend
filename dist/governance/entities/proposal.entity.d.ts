import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Vote } from './vote.entity';
export type ProposalStatus = 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXECUTED';
export declare class Proposal extends BaseEntity {
    title: string;
    description: string;
    proposer: User;
    endsAt: number;
    status: ProposalStatus;
    votes: Vote[];
}
