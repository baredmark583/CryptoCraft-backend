import { IsEnum } from 'class-validator';

export class CastVoteDto {
  @IsEnum(['FOR', 'AGAINST'])
  choice: 'FOR' | 'AGAINST';
}
