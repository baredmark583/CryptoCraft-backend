import { Controller, Get, Post, Body, Param, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GovernanceService } from './governance.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CastVoteDto } from './dto/cast-vote.dto';

@Controller('governance/proposals')
@UseGuards(JwtAuthGuard)
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Post()
  createProposal(@Req() req, @Body() createDto: CreateProposalDto) {
    return this.governanceService.createProposal(req.user.userId, createDto);
  }

  @Get()
  getAllProposals() {
    return this.governanceService.findAllProposals();
  }

  @Get(':id')
  getProposalById(@Param('id', ParseUUIDPipe) id: string) {
    return this.governanceService.findProposalById(id);
  }

  @Post(':id/vote')
  castVote(
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() castVoteDto: CastVoteDto,
  ) {
    return this.governanceService.castVote(id, req.user.userId, castVoteDto);
  }
}
