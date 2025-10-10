import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal } from './entities/proposal.entity';
import { Vote } from './entities/vote.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CastVoteDto } from './dto/cast-vote.dto';

@Injectable()
export class GovernanceService {
  constructor(
    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async mapProposal(proposal: Proposal) {
    const votesFor = await this.voteRepository.count({ where: { proposal: { id: proposal.id }, choice: 'FOR' } });
    const votesAgainst = await this.voteRepository.count({ where: { proposal: { id: proposal.id }, choice: 'AGAINST' } });
    const votes = await this.voteRepository.find({ where: { proposal: { id: proposal.id } } });
    const voters = votes.reduce((acc, vote) => {
        acc[vote.voter.id] = vote.choice;
        return acc;
    }, {});

    return { ...proposal, votesFor, votesAgainst, voters };
  }

  async createProposal(proposerId: string, createDto: CreateProposalDto) {
    const proposer = await this.userRepository.findOneBy({ id: proposerId });
    if (!proposer) throw new NotFoundException('Proposer not found');
    if (proposer.verificationLevel !== 'PRO') {
        throw new ForbiddenException('Only PRO users can create proposals.');
    }

    const proposal = this.proposalRepository.create({ ...createDto, proposer });
    return this.proposalRepository.save(proposal);
  }

  async findAllProposals() {
    const proposals = await this.proposalRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['proposer'],
    });
    return Promise.all(proposals.map(p => this.mapProposal(p)));
  }

  async findProposalById(id: string) {
    const proposal = await this.proposalRepository.findOne({ where: { id }, relations: ['proposer'] });
    if (!proposal) throw new NotFoundException('Proposal not found');
    return this.mapProposal(proposal);
  }

  async castVote(proposalId: string, voterId: string, castVoteDto: CastVoteDto) {
    const proposal = await this.proposalRepository.findOneBy({ id: proposalId });
    if (!proposal) throw new NotFoundException('Proposal not found');

    const voter = await this.userRepository.findOneBy({ id: voterId });
    if (!voter) throw new NotFoundException('Voter not found');
    
    if (voter.verificationLevel !== 'PRO' && voter.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Only PRO users and Admins can vote.');
    }
    if (proposal.endsAt < Date.now()) {
        throw new BadRequestException('Voting for this proposal has ended.');
    }

    const existingVote = await this.voteRepository.findOne({ where: { proposal: { id: proposalId }, voter: { id: voterId } } });
    if (existingVote) {
      throw new BadRequestException('You have already voted on this proposal.');
    }

    const vote = this.voteRepository.create({
      proposal,
      voter,
      choice: castVoteDto.choice,
    });
    await this.voteRepository.save(vote);
    return this.findProposalById(proposalId);
  }
}
