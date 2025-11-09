import { ConfigService } from '@nestjs/config';
import { CategoriesService } from '../categories/categories.service';
import type { GeneratedListing, ImportedListingData, SellerAnalytics, SellerDashboardData } from '../types';
import type { CategorySchema } from '../constants';
import { GeminiProvider } from './providers/gemini.provider';
import { DeepSeekProvider } from './providers/deepseek.provider';
import type { AiResponse } from './ai.types';
export declare class AiService {
    private readonly configService;
    private readonly categoriesService;
    private readonly gemini;
    private readonly deepseek;
    private readonly logger;
    private readonly providerRegistry;
    private readonly scenarioProviders;
    private readonly maxImageBytes;
    private readonly maxHtmlChars;
    private readonly maxImageDimension;
    private readonly jpegQuality;
    constructor(configService: ConfigService, categoriesService: CategoriesService, gemini: GeminiProvider, deepseek: DeepSeekProvider);
    generateListingDetails(imageBase64: string, userDescription: string): Promise<AiResponse<GeneratedListing>>;
    editImage(imageBase64: string, mimeType: string, prompt: string): Promise<AiResponse<{
        base64Image: string;
    }>>;
    analyzeDocumentForVerification(imageBase64: string): Promise<AiResponse<any>>;
    getAnalyticsInsights(analyticsData: SellerAnalytics): Promise<AiResponse<any>>;
    generateDashboardFocus(dashboardData: SellerDashboardData): Promise<AiResponse<any>>;
    processImportedHtml(html: string): Promise<AiResponse<ImportedListingData>>;
    generateCategoryStructure(description: string): Promise<AiResponse<CategorySchema[]>>;
    generateAndSaveSubcategories(parentId: string, parentName: string): Promise<AiResponse<{
        success: boolean;
        generatedCount: number;
        parentId: string;
    }>>;
    private runWithMetrics;
    private normalizeImagePayload;
    private truncateHtmlPayload;
    private getNumberEnv;
    private resolveProvider;
    private bytesToMb;
}
