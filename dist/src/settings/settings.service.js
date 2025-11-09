"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const setting_entity_1 = require("./entities/setting.entity");
const setting_audit_entity_1 = require("./entities/setting-audit.entity");
let SettingsService = class SettingsService {
    constructor(settingRepository, settingAuditRepository) {
        this.settingRepository = settingRepository;
        this.settingAuditRepository = settingAuditRepository;
    }
    findAll() {
        return this.settingRepository.find({ order: { key: 'ASC' } });
    }
    async updateBatch(updateSettingDtos, updatedBy) {
        const keys = updateSettingDtos.map((dto) => dto.key);
        const existingSettings = await this.settingRepository.find({
            where: { key: (0, typeorm_2.In)(keys) },
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
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(setting_entity_1.Setting)),
    __param(1, (0, typeorm_1.InjectRepository)(setting_audit_entity_1.SettingAudit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SettingsService);
//# sourceMappingURL=settings.service.js.map