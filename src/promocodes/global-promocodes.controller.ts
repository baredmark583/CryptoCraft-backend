import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';
import { GlobalPromoCodesService } from './global-promocodes.service';
import { CreateGlobalPromoCodeDto } from './dto/create-global-promocode.dto';
import { UpdateGlobalPromoCodeDto } from './dto/update-global-promocode.dto';

@Controller('global-promocodes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@UseInterceptors(AuditInterceptor)
export class GlobalPromoCodesController {
  constructor(private readonly globalPromoCodesService: GlobalPromoCodesService) {}

  @Get()
  findAll() {
    return this.globalPromoCodesService.findAll();
  }

  @Post()
  create(@Body() dto: CreateGlobalPromoCodeDto, @Req() req) {
    return this.globalPromoCodesService.create(dto, req.user?.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGlobalPromoCodeDto,
    @Req() req,
  ) {
    return this.globalPromoCodesService.update(id, dto, req.user?.userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.globalPromoCodesService.remove(id);
  }
}
