import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Patch()
  updateBatch(@Body() updateSettingDtos: UpdateSettingDto[]) {
    return this.settingsService.updateBatch(updateSettingDtos);
  }
}