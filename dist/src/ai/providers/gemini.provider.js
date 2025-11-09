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
exports.GeminiProvider = void 0;
const config_1 = require("@nestjs/config");
const genai_1 = require("@google/genai");
const common_1 = require("@nestjs/common");
const constants_1 = require("../../constants");
let GeminiProvider = class GeminiProvider {
    constructor(configService) {
        this.configService = configService;
        this.name = 'gemini';
        const apiKey = this.configService.get('API_KEY');
        if (!apiKey) {
            throw new common_1.InternalServerErrorException('Gemini API key is not configured');
        }
        this.ai = new genai_1.GoogleGenAI({ apiKey });
    }
    mapUsage(response) {
        const usage = response?.response?.usageMetadata ?? response?.usageMetadata;
        if (!usage) {
            return undefined;
        }
        return {
            promptTokens: usage.promptTokenCount ??
                usage.promptTokens ??
                usage.inputTokenCount,
            completionTokens: usage.candidatesTokenCount ??
                usage.completionTokens ??
                usage.outputTokenCount,
            totalTokens: usage.totalTokenCount ?? usage.totalTokens,
            cachedTokens: usage.cachedContentTokenCount ?? usage.cachedTokens,
        };
    }
    async generateListingDetails(imageBase64, userDescription) {
        const prompt = `Ты — интеллектуальный ассистент для маркетплейса CryptoCraft. ...`;
        const imagePart = { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } };
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: genai_1.Type.OBJECT,
                    properties: {
                        title: { type: genai_1.Type.STRING },
                        description: { type: genai_1.Type.STRING },
                        price: { type: genai_1.Type.NUMBER },
                        category: { type: genai_1.Type.STRING, enum: (0, constants_1.getCategoryNames)() },
                        dynamicAttributes: { type: genai_1.Type.STRING },
                    },
                    required: ['title', 'description', 'price', 'category', 'dynamicAttributes']
                }
            }
        });
        const parsed = JSON.parse(response.text);
        if (typeof parsed.dynamicAttributes === 'string') {
            parsed.dynamicAttributes = JSON.parse(parsed.dynamicAttributes);
        }
        return { data: parsed, usage: this.mapUsage(response) };
    }
    async editImage(imageBase64, mimeType, prompt) {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ inlineData: { data: imageBase64, mimeType } }, { text: prompt }] },
            config: { responseModalities: [genai_1.Modality.IMAGE, genai_1.Modality.TEXT] },
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return {
                    data: { base64Image: part.inlineData.data },
                    usage: this.mapUsage(response),
                };
            }
        }
        throw new common_1.InternalServerErrorException('AI did not return an image');
    }
    async analyzeDocumentForVerification(imageBase64) {
        const prompt = `Проанализируй это изображение...`;
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }, { text: prompt }] },
            config: { responseMimeType: 'application/json', responseSchema: { type: genai_1.Type.OBJECT, properties: { isDocument: { type: genai_1.Type.BOOLEAN }, fullName: { type: genai_1.Type.STRING } }, required: ['isDocument'] } }
        });
        return { data: JSON.parse(response.text), usage: this.mapUsage(response) };
    }
    async getAnalyticsInsights(analyticsData) {
        const prompt = `Проанализируй JSON-объект ... ${JSON.stringify(analyticsData, null, 2)}`;
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: 'application/json', responseSchema: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.OBJECT, properties: { title: { type: genai_1.Type.STRING }, recommendation: { type: genai_1.Type.STRING }, type: { type: genai_1.Type.STRING, enum: ['OPTIMIZATION', 'OPPORTUNITY', 'WARNING'] } }, required: ['title', 'recommendation', 'type'] } } }
        });
        return { data: JSON.parse(response.text), usage: this.mapUsage(response) };
    }
    async generateDashboardFocus(dashboardData) {
        const prompt = `Ты — AI-ассистент ... ${JSON.stringify(dashboardData, null, 2)}`;
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: 'application/json', responseSchema: { type: genai_1.Type.OBJECT, properties: { title: { type: genai_1.Type.STRING }, reason: { type: genai_1.Type.STRING }, ctaText: { type: genai_1.Type.STRING }, ctaLink: { type: genai_1.Type.STRING, enum: ['sales', 'chat', 'analytics', 'settings'] } }, required: ['title', 'reason', 'ctaText', 'ctaLink'] } }
        });
        return { data: JSON.parse(response.text), usage: this.mapUsage(response) };
    }
    async processImportedHtml(html) {
        const prompt = `Проанализируй HTML-код ...`;
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt + '\n\n' + html,
            config: { responseMimeType: 'application/json', responseSchema: { type: genai_1.Type.OBJECT, properties: { title: { type: genai_1.Type.STRING }, description: { type: genai_1.Type.STRING }, originalPrice: { type: genai_1.Type.NUMBER }, originalCurrency: { type: genai_1.Type.STRING }, imageUrls: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } }, category: { type: genai_1.Type.STRING, enum: (0, constants_1.getCategoryNames)() }, dynamicAttributes: { type: genai_1.Type.STRING }, saleType: { type: genai_1.Type.STRING, enum: ['FIXED_PRICE', 'AUCTION'] }, giftWrapAvailable: { type: genai_1.Type.BOOLEAN } }, required: ['title', 'description', 'originalPrice', 'originalCurrency', 'imageUrls', 'category', 'dynamicAttributes', 'saleType', 'giftWrapAvailable'] } }
        });
        const parsed = JSON.parse(response.text);
        if (typeof parsed.dynamicAttributes === 'string') {
            try {
                parsed.dynamicAttributes = JSON.parse(parsed.dynamicAttributes);
            }
            catch {
                parsed.dynamicAttributes = {};
            }
        }
        return { data: parsed, usage: this.mapUsage(response) };
    }
    async generateCategoryStructure(description) {
        const prompt = `Ты — AI-архитектор ... "${description}"`;
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: 'application/json', responseSchema: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.OBJECT } } }
        });
        return { data: JSON.parse(response.text), usage: this.mapUsage(response) };
    }
    async generateSubcategories(parentName) {
        const prompt = `Сгенерируй подкатегории для "${parentName}" ...`;
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: 'application/json' }
        });
        return { data: JSON.parse(response.text), usage: this.mapUsage(response) };
    }
};
exports.GeminiProvider = GeminiProvider;
exports.GeminiProvider = GeminiProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiProvider);
//# sourceMappingURL=gemini.provider.js.map