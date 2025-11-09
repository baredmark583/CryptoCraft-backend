import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { SettingAudit } from './entities/setting-audit.entity';
import { UpdateSettingDto } from './dto/update-setting.dto';
export declare class SettingsService {
    private readonly settingRepository;
    private readonly settingAuditRepository;
    constructor(settingRepository: Repository<Setting>, settingAuditRepository: Repository<SettingAudit>);
    findAll(): Promise<Setting[]>;
    updateBatch(updateSettingDtos: UpdateSettingDto[], updatedBy?: string): Promise<Setting[]>;
    getAuditTrail(limit?: number): Promise<SettingAudit[]>;
}
