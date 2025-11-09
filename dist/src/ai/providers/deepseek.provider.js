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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSeekProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let DeepSeekProvider = class DeepSeekProvider {
    constructor(configService) {
        this.configService = configService;
        this.name = 'deepseek';
        this.apiKey = this.configService.get('DEEPSEEK_API_KEY') || '';
        this.baseUrl = this.configService.get('DEEPSEEK_API_BASE_URL') || 'https://api.deepseek.com';
    }
    mapUsage(usage) {
        if (!usage) {
            return undefined;
        }
        return {
            promptTokens: usage.prompt_tokens ?? usage.promptTokens,
            completionTokens: usage.completion_tokens ?? usage.completionTokens,
            totalTokens: usage.total_tokens ?? usage.totalTokens,
        };
    }
    async chatJson(prompt) {
        if (!this.apiKey) {
            throw new common_1.InternalServerErrorException('DeepSeek API key is not configured');
        }
        const res = await axios_1.default.post(`${this.baseUrl}/v1/chat/completions`, {
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
        }, { headers: { Authorization: `Bearer ${this.apiKey}` } });
        const text = res.data?.choices?.[0]?.message?.content || '{}';
        return {
            data: JSON.parse(text),
            usage: this.mapUsage(res.data?.usage),
        };
    }
    async generateListingDetails(imageBase64, userDescription) {
        const prompt = `Сформируй JSON для листинга по описанию: ${userDescription}. Изображение не обрабатывай.`;
        return this.chatJson(prompt);
    }
    async editImage() {
        throw new common_1.BadRequestException('DeepSeek does not support image editing in this adapter');
    }
    async analyzeDocumentForVerification(imageBase64) {
        const prompt = `Определи, является ли изображение документом. Верни JSON с полями isDocument, fullName (если есть).`;
        return this.chatJson(prompt);
    }
    async getAnalyticsInsights(analyticsData) {
        const prompt = `Проанализируй метрики и дай советы. Данные: ${JSON.stringify(analyticsData)}`;
        return this.chatJson(prompt);
    }
    async generateDashboardFocus(dashboardData) {
        const prompt = `Определи главное действие и верни JSON с title, reason, ctaText, ctaLink. Данные: ${JSON.stringify(dashboardData)}`;
        return this.chatJson(prompt);
    }
    async processImportedHtml(html) {
        const prompt = `Извлеки данные товара из HTML и верни JSON (title, description, price, images, category, dynamicAttributes, saleType, giftWrapAvailable).`;
        return this.chatJson(prompt);
    }
    async generateCategoryStructure(description) {
        const prompt = `Сгенерируй структуру категорий (до 4 уровней) и поля. Описание: ${description}`;
        return this.chatJson(prompt);
    }
    async generateSubcategories(parentName) {
        const prompt = `Сгенерируй подкатегории для ${parentName} c полями.`;
        return this.chatJson(prompt);
    }
};
exports.DeepSeekProvider = DeepSeekProvider;
exports.DeepSeekProvider = DeepSeekProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DeepSeekProvider);
//# sourceMappingURL=deepseek.provider.js.map