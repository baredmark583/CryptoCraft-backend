import { IsNotEmpty, IsString } from 'class-validator';

export class BroadcastDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}