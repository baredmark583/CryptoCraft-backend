import { IsString, IsNotEmpty, MinLength, IsArray, IsOptional, ArrayMaxSize } from 'class-validator';

export class CreateForumThreadDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content: string;

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(5)
  tags?: string[];
}
