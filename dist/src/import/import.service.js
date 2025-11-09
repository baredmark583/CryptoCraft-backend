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
var ImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportService = void 0;
const common_1 = require("@nestjs/common");
const scraping_service_1 = require("../scraping/scraping.service");
const ai_service_1 = require("../ai/ai.service");
const upload_service_1 = require("../upload/upload.service");
let ImportService = ImportService_1 = class ImportService {
    constructor(scrapingService, aiService, uploadService) {
        this.scrapingService = scrapingService;
        this.aiService = aiService;
        this.uploadService = uploadService;
        this.logger = new common_1.Logger(ImportService_1.name);
    }
    async convertCurrency(amount, fromCurrency) {
        const rates = {
            'UAH': 0.025,
            'ГРН': 0.025,
            'USD': 1.0,
            '$': 1.0,
            'EUR': 1.08,
            '€': 1.08,
        };
        const upperCurrency = fromCurrency.toUpperCase();
        const rateKey = Object.keys(rates).find(key => upperCurrency.includes(key));
        const rate = rateKey ? rates[rateKey] : null;
        if (!rate) {
            this.logger.warn(`No conversion rate found for currency: ${fromCurrency}. Returning original amount.`);
            return amount;
        }
        const convertedAmount = amount * rate;
        this.logger.log(`Converted ${amount} ${fromCurrency} to ${convertedAmount.toFixed(2)} USDT`);
        return parseFloat(convertedAmount.toFixed(2));
    }
    async processUrl(url) {
        this.logger.log(`Starting import process for URL: ${url}`);
        const { html } = await this.scrapingService.scrapeUrl(url);
        this.logger.log(`Scraping successful. HTML length: ${html.length}`);
        const aiResult = await this.aiService.processImportedHtml(html);
        const aiData = aiResult.data;
        this.logger.log(`AI processing via ${aiResult.meta.provider} completed in ${aiResult.meta.latencyMs}ms. Title: "${aiData.title}"`);
        const uploadedImageUrls = await Promise.all(aiData.imageUrls.slice(0, 5).map(async (imageUrl) => {
            try {
                const absoluteUrl = new URL(imageUrl, url).href;
                const { url: cloudinaryUrl } = await this.uploadService.uploadFileFromUrl(absoluteUrl);
                this.logger.log(`Uploaded image ${imageUrl} to ${cloudinaryUrl}`);
                return cloudinaryUrl;
            }
            catch (error) {
                this.logger.warn(`Failed to process image URL: ${imageUrl}. Skipping. Error: ${error.message}`);
                return null;
            }
        }));
        const finalImageUrls = uploadedImageUrls.filter(Boolean);
        this.logger.log(`Successfully uploaded ${finalImageUrls.length} images.`);
        const priceInUsdt = await this.convertCurrency(aiData.originalPrice, aiData.originalCurrency);
        const finalListing = {
            ...aiData,
            imageUrls: finalImageUrls,
            price: priceInUsdt,
        };
        this.logger.log(`Import process completed for URL: ${url}`);
        return finalListing;
    }
};
exports.ImportService = ImportService;
exports.ImportService = ImportService = ImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [scraping_service_1.ScrapingService,
        ai_service_1.AiService,
        upload_service_1.UploadService])
], ImportService);
//# sourceMappingURL=import.service.js.map