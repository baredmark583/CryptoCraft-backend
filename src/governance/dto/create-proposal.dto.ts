import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateProposalDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(Date.now() + 3600 * 1000) // Must end at least 1 hour in the future
  endsAt: number;
}
