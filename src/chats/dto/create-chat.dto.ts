import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateChatDto {
  @IsUUID()
  @IsNotEmpty()
  recipientId: string;
}
