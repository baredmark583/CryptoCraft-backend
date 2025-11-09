import { IsBoolean } from 'class-validator';

export class PinThreadDto {
  @IsBoolean()
  isPinned: boolean;
}
