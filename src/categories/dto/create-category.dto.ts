import { Type } from 'class-transformer';
// FIX: Import `IsBoolean` decorator for validation.
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested, IsUUID, IsUrl } from 'class-validator';

// FIX: Export the DTO class to make it accessible to other modules, particularly for `UpdateCategoryDto`.
export class CategoryFieldDto {
    @IsString()
    @IsOptional()
    id: string;
    
    @IsString()
    name: string;

    @IsString()
    label: string;
    
    @IsString()
    type: 'text' | 'number' | 'select';
    
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    options: string[];
    
    // FIX: Add `@IsBoolean` decorator to ensure the property is correctly handled by the validation pipe.
    @IsBoolean()
    @IsOptional()
    required: boolean;
}

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  iconUrl: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryFieldDto)
  @IsOptional()
  fields: CategoryFieldDto[];

  @IsUUID()
  @IsOptional()
  parentId?: string | null;
}