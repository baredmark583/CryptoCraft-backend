import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    findAll(): Promise<import("./entities/setting.entity").Setting[]>;
    updateBatch(req: any, updateSettingDtos: UpdateSettingDto[]): Promise<import("./entities/setting.entity").Setting[]>;
    getAuditTrail(limit?: string): Promise<import("./entities/setting-audit.entity").SettingAudit[]>;
}
