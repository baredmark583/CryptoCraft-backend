"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ScrapingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapingService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let ScrapingService = ScrapingService_1 = class ScrapingService {
    constructor() {
        this.logger = new common_1.Logger(ScrapingService_1.name);
    }
    async scrapeUrl(url) {
        if (!url) {
            throw new common_1.BadRequestException('URL is required');
        }
        this.logger.log(`Scraping URL: ${url}`);
        try {
            const { data: rawHtml } = await axios_1.default.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                },
                timeout: 15000,
            });
            this.logger.log(`Scraping successful, returning raw HTML of length ${rawHtml.length}`);
            return { html: rawHtml };
        }
        catch (error) {
            this.logger.error(`Failed to scrape URL ${url}: ${error.message}`);
            throw new common_1.InternalServerErrorException(`Failed to scrape content from the provided URL. The site may be down or blocking requests.`);
        }
    }
};
exports.ScrapingService = ScrapingService;
exports.ScrapingService = ScrapingService = ScrapingService_1 = __decorate([
    (0, common_1.Injectable)()
], ScrapingService);
//# sourceMappingURL=scraping.service.js.map