import { IsEnum, IsOptional } from 'class-validator';
import { ProposalStatus } from '../entities/proposal.entity';

export class UpdateProposalDto {
  @IsEnum(['ACTIVE', 'PASSED', 'REJECTED', 'EXECUTED'])
  @IsOptional()
  status?: ProposalStatus;
}
