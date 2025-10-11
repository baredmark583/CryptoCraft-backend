import { Controller, Get, Post, Body, Param, UseGuards, Req, ParseUUIDPipe, Patch, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GovernanceService } from './governance.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CastVoteDto } from './dto/cast-vote.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateProposalDto } from './dto/update-proposal.dto';

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

  @Get('/admin')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  getAllProposalsForAdmin() {
    return this.governanceService.findAllForAdmin();
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

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  updateProposal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateProposalDto,
  ) {
    return this.governanceService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  removeProposal(@Param('id', ParseUUIDPipe) id: string) {
    return this.governanceService.remove(id);
  }
}
