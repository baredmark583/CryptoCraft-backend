import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) {}

  findAll() {
    return this.settingRepository.find();
  }

  async updateBatch(updateSettingDtos: UpdateSettingDto[]) {
    const promises = updateSettingDtos.map(dto => {
      // Upsert: update if key exists, insert if it doesn't.
      return this.settingRepository.upsert({ key: dto.key, value: dto.value }, ['key']);
    });
    await Promise.all(promises);
    return this.findAll();
  }
}