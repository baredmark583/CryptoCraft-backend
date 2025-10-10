import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}