import { GovernanceService } from './governance.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CastVoteDto } from './dto/cast-vote.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
export declare class GovernanceController {
    private readonly governanceService;
    constructor(governanceService: GovernanceService);
    createProposal(req: any, createDto: CreateProposalDto): Promise<import("./entities/proposal.entity").Proposal>;
    getAllProposals(): Promise<{
        votesFor: number;
        votesAgainst: number;
        voters: {};
        title: string;
        description: string;
        proposer: import("src/users/entities/user.entity").User;
        endsAt: number;
        status: import("./entities/proposal.entity").ProposalStatus;
        votes: import("./entities/vote.entity").Vote[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt?: Date | null;
    }[]>;
    getAllProposalsForAdmin(): Promise<{
        votesFor: number;
        votesAgainst: number;
        voters: {};
        title: string;
        description: string;
        proposer: import("src/users/entities/user.entity").User;
        endsAt: number;
        status: import("./entities/proposal.entity").ProposalStatus;
        votes: import("./entities/vote.entity").Vote[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt?: Date | null;
    }[]>;
    getProposalById(id: string): Promise<{
        votesFor: number;
        votesAgainst: number;
        voters: {};
        title: string;
        description: string;
        proposer: import("src/users/entities/user.entity").User;
        endsAt: number;
        status: import("./entities/proposal.entity").ProposalStatus;
        votes: import("./entities/vote.entity").Vote[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt?: Date | null;
    }>;
    castVote(req: any, id: string, castVoteDto: CastVoteDto): Promise<{
        votesFor: number;
        votesAgainst: number;
        voters: {};
        title: string;
        description: string;
        proposer: import("src/users/entities/user.entity").User;
        endsAt: number;
        status: import("./entities/proposal.entity").ProposalStatus;
        votes: import("./entities/vote.entity").Vote[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt?: Date | null;
    }>;
    updateProposal(id: string, updateDto: UpdateProposalDto): Promise<{
        votesFor: number;
        votesAgainst: number;
        voters: {};
        title: string;
        description: string;
        proposer: import("src/users/entities/user.entity").User;
        endsAt: number;
        status: import("./entities/proposal.entity").ProposalStatus;
        votes: import("./entities/vote.entity").Vote[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt?: Date | null;
    }>;
    removeProposal(id: string): Promise<{
        success: boolean;
    }>;
}
