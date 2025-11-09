import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { Setting } from './entities/setting.entity';
import { SettingAudit } from './entities/setting-audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Setting, SettingAudit])],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
