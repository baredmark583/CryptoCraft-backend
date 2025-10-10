import { IsString, IsNotEmpty } from 'class-validator';

export class CreateWorkshopCommentDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}