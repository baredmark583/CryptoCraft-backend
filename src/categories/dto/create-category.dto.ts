import { Type } from 'class-transformer';
// FIX: Import `IsBoolean` decorator for validation.
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

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
    
    // FIX: Add `@IsBoolean` decorator to ensure the property is correctly handled by the validation pipe.
    @IsBoolean()
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