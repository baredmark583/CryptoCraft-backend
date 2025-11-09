import type { AiProviderResult, AiProviderName } from '../ai.types';

export interface AiProvider {
  readonly name: AiProviderName;
  generateListingDetails(imageBase64: string, userDescription: string): Promise<AiProviderResult<any>>;
  editImage(
    imageBase64: string,
    mimeType: string,
    prompt: string,
  ): Promise<AiProviderResult<{ base64Image: string }>>;
  analyzeDocumentForVerification(imageBase64: string): Promise<AiProviderResult<any>>;
  getAnalyticsInsights(analyticsData: any): Promise<AiProviderResult<any>>;
  generateDashboardFocus(dashboardData: any): Promise<AiProviderResult<any>>;
  processImportedHtml(html: string): Promise<AiProviderResult<any>>;
  generateCategoryStructure(description: string): Promise<AiProviderResult<any>>;
  generateSubcategories(parentName: string): Promise<AiProviderResult<any>>;
}


