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
exports.IconsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const icon_entity_1 = require("./entities/icon.entity");
const axios_1 = require("axios");
let IconsService = class IconsService {
    constructor(iconRepository) {
        this.iconRepository = iconRepository;
    }
    async fetchSvgFromUrl(url) {
        try {
            const response = await axios_1.default.get(url, {
                headers: { 'Accept': 'image/svg+xml' },
                timeout: 5000,
            });
            if (typeof response.data !== 'string' || !response.data.trim().startsWith('<svg')) {
                throw new Error('Response is not a valid SVG file.');
            }
            return response.data;
        }
        catch (error) {
            console.error(`Failed to fetch SVG from ${url}`, error);
            throw new common_1.BadRequestException(`Could not fetch a valid SVG from the provided URL.`);
        }
    }
    async create(createIconDto) {
        const { iconUrl, ...restDto } = createIconDto;
        if (!iconUrl && !restDto.svgContent) {
            throw new common_1.BadRequestException('Either svgContent or iconUrl must be provided.');
        }
        const iconData = { ...restDto };
        if (iconUrl) {
            iconData.svgContent = await this.fetchSvgFromUrl(iconUrl);
        }
        const icon = this.iconRepository.create(iconData);
        return this.iconRepository.save(icon);
    }
    async upsert(upsertIconDto) {
        const { name, iconUrl, svgContent, width, height } = upsertIconDto;
        if (!iconUrl && !svgContent) {
            throw new common_1.BadRequestException('Either svgContent or iconUrl must be provided.');
        }
        const iconData = { name, width, height };
        if (iconUrl) {
            iconData.svgContent = await this.fetchSvgFromUrl(iconUrl);
        }
        else if (svgContent) {
            iconData.svgContent = svgContent;
        }
        const existingIcon = await this.iconRepository.findOne({ where: { name } });
        if (existingIcon) {
            await this.iconRepository.update(existingIcon.id, { svgContent: iconData.svgContent, width: iconData.width, height: iconData.height });
            return this.findOne(existingIcon.id);
        }
        else {
            const newIcon = this.iconRepository.create(iconData);
            return this.iconRepository.save(newIcon);
        }
    }
    findAll() {
        return this.iconRepository.find({ order: { name: 'ASC' } });
    }
    async findOne(id) {
        const icon = await this.iconRepository.findOneBy({ id });
        if (!icon) {
            throw new common_1.NotFoundException(`Icon with ID ${id} not found`);
        }
        return icon;
    }
    async update(id, updateIconDto) {
        const { name, iconUrl, svgContent, width, height } = updateIconDto;
        const updatePayload = { name, width, height };
        if (iconUrl) {
            updatePayload.svgContent = await this.fetchSvgFromUrl(iconUrl);
        }
        else if (svgContent) {
            updatePayload.svgContent = svgContent;
        }
        const icon = await this.iconRepository.preload({ id, ...updatePayload });
        if (!icon) {
            throw new common_1.NotFoundException(`Icon with ID ${id} not found`);
        }
        return this.iconRepository.save(icon);
    }
    async syncMissing(iconDtos) {
        if (!iconDtos || iconDtos.length === 0) {
            return { created: 0 };
        }
        const existing = await this.iconRepository.find({ select: ['name'] });
        const knownNames = new Set(existing.map(icon => icon.name));
        let created = 0;
        for (const dto of iconDtos) {
            if (!dto.name || knownNames.has(dto.name)) {
                continue;
            }
            await this.upsert(dto);
            knownNames.add(dto.name);
            created += 1;
        }
        return { created };
    }
    async remove(id) {
        const result = await this.iconRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Icon with ID ${id} not found`);
        }
        return { success: true };
    }
};
exports.IconsService = IconsService;
exports.IconsService = IconsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(icon_entity_1.Icon)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], IconsService);
//# sourceMappingURL=icons.service.js.map