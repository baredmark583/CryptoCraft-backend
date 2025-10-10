import { IsString, IsNotEmpty } from 'class-validator';

export class CreateForumPostDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}