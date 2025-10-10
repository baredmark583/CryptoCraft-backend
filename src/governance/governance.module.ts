import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GovernanceService } from './governance.service';
import { GovernanceController } from './governance.controller';
import { Proposal } from './entities/proposal.entity';
import { Vote } from './entities/vote.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal, Vote, User])],
  controllers: [GovernanceController],
  providers: [GovernanceService],
})
export class GovernanceModule {}
