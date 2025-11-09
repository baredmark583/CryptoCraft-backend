import { AiService } from './ai.service';
import { GenerateListingDto } from './dto/generate-listing.dto';
import { EditImageDto } from './dto/edit-image.dto';
import { AnalyzeDocumentDto } from './dto/analyze-document.dto';
import { AnalyticsInsightsDto } from './dto/analytics-insights.dto';
import { DashboardFocusDto } from './dto/dashboard-focus.dto';
import { ProcessHtmlDto } from './dto/process-html.dto';
import { GenerateCategoryStructureDto } from './dto/generate-category-structure.dto';
import { GenerateSubcategoriesDto } from './dto/generate-subcategories.dto';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    generateListing(generateListingDto: GenerateListingDto): Promise<import("./ai.types").AiResponse<import("../types").GeneratedListing>>;
    editImage(editImageDto: EditImageDto): Promise<import("./ai.types").AiResponse<{
        base64Image: string;
    }>>;
    analyzeDocument(analyzeDocumentDto: AnalyzeDocumentDto): Promise<import("./ai.types").AiResponse<any>>;
    getAnalyticsInsights(analyticsInsightsDto: AnalyticsInsightsDto): Promise<import("./ai.types").AiResponse<any>>;
    getDashboardFocus(dashboardFocusDto: DashboardFocusDto): Promise<import("./ai.types").AiResponse<any>>;
    processHtml(processHtmlDto: ProcessHtmlDto): Promise<import("./ai.types").AiResponse<import("../types").ImportedListingData>>;
    generateCategoryStructure(generateCategoryStructureDto: GenerateCategoryStructureDto): Promise<import("./ai.types").AiResponse<import("../constants").CategorySchema[]>>;
    generateAndSaveSubcategories(generateSubcategoriesDto: GenerateSubcategoriesDto): Promise<import("./ai.types").AiResponse<{
        success: boolean;
        generatedCount: number;
        parentId: string;
    }>>;
}
