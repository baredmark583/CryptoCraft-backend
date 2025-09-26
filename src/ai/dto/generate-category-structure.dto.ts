import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateCategoryStructureDto {
  @IsString()
  @IsNotEmpty()
  description: string;
}
