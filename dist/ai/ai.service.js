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
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const categories_service_1 = require("../categories/categories.service");
const gemini_provider_1 = require("./providers/gemini.provider");
const deepseek_provider_1 = require("./providers/deepseek.provider");
const sharp_1 = require("sharp");
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
let AiService = AiService_1 = class AiService {
    constructor(configService, categoriesService, gemini, deepseek) {
        this.configService = configService;
        this.categoriesService = categoriesService;
        this.gemini = gemini;
        this.deepseek = deepseek;
        this.logger = new common_1.Logger(AiService_1.name);
        this.providerRegistry = {
            gemini: this.gemini,
            deepseek: this.deepseek,
        };
        this.scenarioProviders = {
            text: this.resolveProvider('AI_PROVIDER_TEXT', 'deepseek'),
            vision: this.resolveProvider('AI_PROVIDER_VISION', 'deepseek'),
            'image-edit': this.resolveProvider('AI_PROVIDER_IMAGE_EDIT', 'gemini'),
        };
        this.maxHtmlChars = this.getNumberEnv('AI_MAX_HTML_CHARS', 60000);
        const imageLimitMb = this.getNumberEnv('AI_MAX_IMAGE_MB', 4);
        this.maxImageBytes = this.getNumberEnv('AI_MAX_IMAGE_BYTES', imageLimitMb * 1024 * 1024);
        this.maxImageDimension = this.getNumberEnv('AI_MAX_IMAGE_DIMENSION', 1536);
        this.jpegQuality = this.getNumberEnv('AI_IMAGE_JPEG_QUALITY', 82);
    }
    async generateListingDetails(imageBase64, userDescription) {
        const warnings = [];
        const { base64 } = await this.normalizeImagePayload(imageBase64, {
            scenario: 'vision',
            warnings,
        });
        return this.runWithMetrics('vision', provider => provider.generateListingDetails(base64, userDescription), { warnings });
    }
    async editImage(imageBase64, mimeType, prompt) {
        const warnings = [];
        const { base64, mimeType: sanitizedMime } = await this.normalizeImagePayload(imageBase64, {
            scenario: 'image-edit',
            mimeType,
            warnings,
        });
        return this.runWithMetrics('image-edit', provider => provider.editImage(base64, sanitizedMime, prompt), { warnings });
    }
    async analyzeDocumentForVerification(imageBase64) {
        const warnings = [];
        const { base64 } = await this.normalizeImagePayload(imageBase64, {
            scenario: 'vision',
            warnings,
        });
        return this.runWithMetrics('vision', provider => provider.analyzeDocumentForVerification(base64), { warnings });
    }
    async getAnalyticsInsights(analyticsData) {
        return this.runWithMetrics('text', provider => provider.getAnalyticsInsights(analyticsData));
    }
    async generateDashboardFocus(dashboardData) {
        return this.runWithMetrics('text', provider => provider.generateDashboardFocus(dashboardData));
    }
    async processImportedHtml(html) {
        const { payload, warnings } = this.truncateHtmlPayload(html);
        return this.runWithMetrics('text', provider => provider.processImportedHtml(payload), { warnings });
    }
    async generateCategoryStructure(description) {
        return this.runWithMetrics('text', provider => provider.generateCategoryStructure(description));
    }
    async generateAndSaveSubcategories(parentId, parentName) {
        const generated = await this.runWithMetrics('text', provider => provider.generateSubcategories(parentName));
        await this.categoriesService.batchCreateSubcategories(generated.data, parentId);
        return {
            data: {
                success: true,
                generatedCount: Array.isArray(generated.data) ? generated.data.length : 0,
                parentId,
            },
            meta: generated.meta,
        };
    }
    async runWithMetrics(scenario, executor, extra) {
        const provider = this.scenarioProviders[scenario];
        const startedAt = Date.now();
        try {
            const { data, usage } = await executor(provider);
            return {
                data,
                meta: {
                    provider: provider.name,
                    scenario,
                    latencyMs: Date.now() - startedAt,
                    usage,
                    warnings: extra?.warnings?.length ? extra.warnings : undefined,
                },
            };
        }
        catch (error) {
            this.logger.error(`AI ${scenario} call via ${provider.name} failed`, error instanceof Error ? error.stack : error);
            if (error instanceof common_1.BadRequestException || error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Сервис AI временно недоступен');
        }
    }
    async normalizeImagePayload(base64, options) {
        const mime = options.mimeType && ALLOWED_IMAGE_MIME_TYPES.has(options.mimeType.toLowerCase())
            ? options.mimeType
            : 'image/jpeg';
        const buffer = Buffer.from(base64, 'base64');
        if (buffer.length <= this.maxImageBytes) {
            return { base64, mimeType: mime };
        }
        this.logger.warn(`Image payload for ${options.scenario} is ${this.bytesToMb(buffer.length)}MB, attempting resize`);
        try {
            const resized = await (0, sharp_1.default)(buffer)
                .rotate()
                .resize({
                width: this.maxImageDimension,
                height: this.maxImageDimension,
                fit: 'inside',
            })
                .toFormat('jpeg', { quality: this.jpegQuality, mozjpeg: true })
                .toBuffer();
            if (resized.length > this.maxImageBytes) {
                throw new common_1.BadRequestException(`Изображение остаётся больше ${this.bytesToMb(this.maxImageBytes)}MB даже после сжатия`);
            }
            options.warnings.push('IMAGE_RESIZED');
            return { base64: resized.toString('base64'), mimeType: 'image/jpeg' };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error('Failed to downscale oversized image', error);
            throw new common_1.InternalServerErrorException('Не удалось обработать изображение. Попробуйте файл меньшего размера.');
        }
    }
    truncateHtmlPayload(html) {
        if (!html) {
            throw new common_1.BadRequestException('HTML контент не должен быть пустым');
        }
        if (html.length <= this.maxHtmlChars) {
            return { payload: html };
        }
        this.logger.warn(`HTML payload truncated from ${html.length} chars to ${this.maxHtmlChars}`);
        return {
            payload: html.slice(0, this.maxHtmlChars),
            warnings: ['HTML_TRUNCATED'],
        };
    }
    getNumberEnv(key, fallback) {
        const raw = this.configService.get(key);
        const parsed = raw ? Number(raw) : NaN;
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    resolveProvider(envKey, fallback) {
        const requested = this.configService.get(envKey)?.toLowerCase() || fallback;
        const provider = this.providerRegistry[requested] ?? this.providerRegistry[fallback];
        if (!this.providerRegistry[requested]) {
            this.logger.warn(`Provider "${requested}" from ${envKey} is unavailable. Falling back to ${provider.name}`);
        }
        return provider;
    }
    bytesToMb(bytes) {
        return (bytes / (1024 * 1024)).toFixed(2);
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        categories_service_1.CategoriesService,
        gemini_provider_1.GeminiProvider,
        deepseek_provider_1.DeepSeekProvider])
], AiService);
//# sourceMappingURL=ai.service.js.map