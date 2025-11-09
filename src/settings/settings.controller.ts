import { Controller, Get, Patch, Body, UseGuards, UseInterceptors, Req, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@UseInterceptors(AuditInterceptor)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Patch()
  updateBatch(@Req() req, @Body() updateSettingDtos: UpdateSettingDto[]) {
    return this.settingsService.updateBatch(updateSettingDtos, req.user?.userId);
  }

  @Get('audit')
  getAuditTrail(@Query('limit') limit = '50') {
    return this.settingsService.getAuditTrail(Number(limit));
  }
}
