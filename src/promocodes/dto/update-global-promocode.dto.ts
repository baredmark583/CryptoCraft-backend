import { PartialType } from '@nestjs/mapped-types';
import { CreateGlobalPromoCodeDto } from './create-global-promocode.dto';

export class UpdateGlobalPromoCodeDto extends PartialType(CreateGlobalPromoCodeDto) {}
