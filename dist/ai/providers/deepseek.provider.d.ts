import { ConfigService } from '@nestjs/config';
import { AiProvider } from './ai.provider';
import type { AiProviderResult } from '../ai.types';
export declare class DeepSeekProvider implements AiProvider {
    private readonly configService;
    readonly name: "deepseek";
    private readonly apiKey;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    private mapUsage;
    private chatJson;
    generateListingDetails(imageBase64: string, userDescription: string): Promise<AiProviderResult<any>>;
    editImage(): Promise<AiProviderResult<{
        base64Image: string;
    }>>;
    analyzeDocumentForVerification(imageBase64: string): Promise<AiProviderResult<any>>;
    getAnalyticsInsights(analyticsData: any): Promise<AiProviderResult<any>>;
    generateDashboardFocus(dashboardData: any): Promise<AiProviderResult<any>>;
    processImportedHtml(html: string): Promise<AiProviderResult<any>>;
    generateCategoryStructure(description: string): Promise<AiProviderResult<any>>;
    generateSubcategories(parentName: string): Promise<AiProviderResult<any>>;
}
