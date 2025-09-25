import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

// FIX: Export the DTO class to make it accessible to other modules, particularly for `UpdateCategoryDto`.
export class CategoryFieldDto {
    @IsString()
    id: string;
    
    @IsString()
    name: string;

    @IsString()
    label: string;
    
    @IsString()
    type: 'text' | 'number' | 'select';
    
    @IsString({ each: true })
    @IsArray()
    options: string[];
    
    required: boolean;
}

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  iconId: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryFieldDto)
  fields: CategoryFieldDto[];
}