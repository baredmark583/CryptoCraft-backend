import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class GenerateSubcategoriesDto {
  @IsUUID()
  @IsNotEmpty()
  parentId: string;
  
  @IsString()
  @IsNotEmpty()
  parentName: string;
}
