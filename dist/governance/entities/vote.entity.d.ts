import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { Proposal } from './proposal.entity';
export type VoteChoice = 'FOR' | 'AGAINST';
export declare class Vote extends BaseEntity {
    voter: User;
    proposal: Proposal;
    choice: VoteChoice;
}
