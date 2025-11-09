"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const proposal_entity_1 = require("./entities/proposal.entity");
const vote_entity_1 = require("./entities/vote.entity");
const user_entity_1 = require("../users/entities/user.entity");
let GovernanceService = class GovernanceService {
    constructor(proposalRepository, voteRepository, userRepository) {
        this.proposalRepository = proposalRepository;
        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
    }
    async mapProposal(proposal) {
        const votesFor = await this.voteRepository.count({ where: { proposal: { id: proposal.id }, choice: 'FOR' } });
        const votesAgainst = await this.voteRepository.count({ where: { proposal: { id: proposal.id }, choice: 'AGAINST' } });
        const votes = await this.voteRepository.find({ where: { proposal: { id: proposal.id } }, relations: ['voter'] });
        const voters = votes.reduce((acc, vote) => {
            acc[vote.voter.id] = vote.choice;
            return acc;
        }, {});
        return { ...proposal, votesFor, votesAgainst, voters };
    }
    async createProposal(proposerId, createDto) {
        let proposer;
        if (proposerId === 'admin-user') {
            proposer = await this.userRepository.findOne({ where: { role: user_entity_1.UserRole.SUPER_ADMIN, name: 'CryptoCraft Platform' } });
            if (!proposer) {
                proposer = this.userRepository.create({
                    name: 'CryptoCraft Platform',
                    role: user_entity_1.UserRole.SUPER_ADMIN,
                    email: 'platform@cryptocraft.app',
                    avatarUrl: 'https://www.scnsoft.com/ecommerce/cryptocurrency-ecommerce/cryptocurrency-ecommerce_cover.svg'
                });
                await this.userRepository.save(proposer);
            }
        }
        else {
            proposer = await this.userRepository.findOneBy({ id: proposerId });
        }
        if (!proposer)
            throw new common_1.NotFoundException('Proposer could not be determined.');
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
    async findAllForAdmin() {
        const proposals = await this.proposalRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['proposer'],
        });
        return Promise.all(proposals.map(p => this.mapProposal(p)));
    }
    async findProposalById(id) {
        const proposal = await this.proposalRepository.findOne({ where: { id }, relations: ['proposer'] });
        if (!proposal)
            throw new common_1.NotFoundException('Proposal not found');
        return this.mapProposal(proposal);
    }
    async castVote(proposalId, voterId, castVoteDto) {
        const proposal = await this.proposalRepository.findOneBy({ id: proposalId });
        if (!proposal)
            throw new common_1.NotFoundException('Proposal not found');
        const voter = await this.userRepository.findOneBy({ id: voterId });
        if (!voter)
            throw new common_1.NotFoundException('Voter not found');
        if (proposal.endsAt < Date.now()) {
            throw new common_1.BadRequestException('Voting for this proposal has ended.');
        }
        const existingVote = await this.voteRepository.findOne({ where: { proposal: { id: proposalId }, voter: { id: voterId } } });
        if (existingVote) {
            throw new common_1.BadRequestException('You have already voted on this proposal.');
        }
        const vote = this.voteRepository.create({
            proposal,
            voter,
            choice: castVoteDto.choice,
        });
        await this.voteRepository.save(vote);
        return this.findProposalById(proposalId);
    }
    async update(id, updateDto) {
        const proposal = await this.proposalRepository.preload({ id, ...updateDto });
        if (!proposal) {
            throw new common_1.NotFoundException(`Proposal with ID ${id} not found.`);
        }
        const savedProposal = await this.proposalRepository.save(proposal);
        return this.mapProposal(savedProposal);
    }
    async remove(id) {
        const result = await this.proposalRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Proposal with ID ${id} not found.`);
        }
        return { success: true };
    }
};
exports.GovernanceService = GovernanceService;
exports.GovernanceService = GovernanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(proposal_entity_1.Proposal)),
    __param(1, (0, typeorm_1.InjectRepository)(vote_entity_1.Vote)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], GovernanceService);
//# sourceMappingURL=governance.service.js.map