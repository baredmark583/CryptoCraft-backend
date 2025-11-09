import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateIconDto } from './create-icon.dto';

export class SyncIconsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIconDto)
  icons: CreateIconDto[];
}
