import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GenerateListingDto } from './dto/generate-listing.dto';
import { EditImageDto } from './dto/edit-image.dto';
import { AnalyzeDocumentDto } from './dto/analyze-document.dto';
import { AnalyticsInsightsDto } from './dto/analytics-insights.dto';
import { DashboardFocusDto } from './dto/dashboard-focus.dto';
import { ProcessHtmlDto } from './dto/process-html.dto';
import { GenerateCategoryStructureDto } from './dto/generate-category-structure.dto';
import { GenerateSubcategoriesDto } from './dto/generate-subcategories.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-listing')
  generateListing(@Body() generateListingDto: GenerateListingDto) {
    return this.aiService.generateListingDetails(
      generateListingDto.imageBase64,
      generateListingDto.userDescription,
    );
  }

  @Post('edit-image')
  editImage(@Body() editImageDto: EditImageDto) {
    return this.aiService.editImage(
      editImageDto.imageBase64,
      editImageDto.mimeType,
      editImageDto.prompt,
    );
  }
  
  @Post('analyze-document')
  analyzeDocument(@Body() analyzeDocumentDto: AnalyzeDocumentDto) {
      return this.aiService.analyzeDocumentForVerification(analyzeDocumentDto.imageBase64);
  }
  
  @Post('analytics-insights')
  getAnalyticsInsights(@Body() analyticsInsightsDto: AnalyticsInsightsDto) {
      return this.aiService.getAnalyticsInsights(analyticsInsightsDto.analyticsData);
  }

  @Post('dashboard-focus')
  getDashboardFocus(@Body() dashboardFocusDto: DashboardFocusDto) {
      return this.aiService.generateDashboardFocus(dashboardFocusDto.dashboardData);
  }
  
  @Post('process-html')
  processHtml(@Body() processHtmlDto: ProcessHtmlDto) {
      return this.aiService.processImportedHtml(processHtmlDto.html);
  }

  @Post('generate-category-structure')
  generateCategoryStructure(@Body() generateCategoryStructureDto: GenerateCategoryStructureDto) {
    return this.aiService.generateCategoryStructure(generateCategoryStructureDto.description);
  }

  @Post('generate-and-save-subcategories')
  generateAndSaveSubcategories(@Body() generateSubcategoriesDto: GenerateSubcategoriesDto) {
    return this.aiService.generateAndSaveSubcategories(
      generateSubcategoriesDto.parentId,
      generateSubcategoriesDto.parentName,
    );
  }
}