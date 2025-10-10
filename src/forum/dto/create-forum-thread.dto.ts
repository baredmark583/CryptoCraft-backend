import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateForumThreadDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content: string;
}