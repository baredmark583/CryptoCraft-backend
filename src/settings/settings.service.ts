import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { SettingAudit } from './entities/setting-audit.entity';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    @InjectRepository(SettingAudit)
    private readonly settingAuditRepository: Repository<SettingAudit>,
  ) {}

  findAll() {
    return this.settingRepository.find({ order: { key: 'ASC' } });
  }

  async updateBatch(updateSettingDtos: UpdateSettingDto[], updatedBy?: string) {
    const keys = updateSettingDtos.map((dto) => dto.key);
    const existingSettings = await this.settingRepository.find({
      where: { key: In(keys) },
    });
    const existingMap = new Map(existingSettings.map((setting) => [setting.key, setting]));

    for (const dto of updateSettingDtos) {
      const current = existingMap.get(dto.key);
      const oldValue = current?.value ?? null;
      if (oldValue === dto.value) {
        continue;
      }

      await this.settingRepository.save({
        key: dto.key,
        value: dto.value,
        updatedBy,
      });
      await this.settingAuditRepository.save({
        key: dto.key,
        oldValue,
        newValue: dto.value,
        updatedBy,
      });
    }

    return this.findAll();
  }

  getAuditTrail(limit = 50) {
    return this.settingAuditRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
