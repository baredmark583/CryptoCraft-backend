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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const generate_listing_dto_1 = require("./dto/generate-listing.dto");
const edit_image_dto_1 = require("./dto/edit-image.dto");
const analyze_document_dto_1 = require("./dto/analyze-document.dto");
const analytics_insights_dto_1 = require("./dto/analytics-insights.dto");
const dashboard_focus_dto_1 = require("./dto/dashboard-focus.dto");
const process_html_dto_1 = require("./dto/process-html.dto");
const generate_category_structure_dto_1 = require("./dto/generate-category-structure.dto");
const generate_subcategories_dto_1 = require("./dto/generate-subcategories.dto");
let AiController = class AiController {
    constructor(aiService) {
        this.aiService = aiService;
    }
    generateListing(generateListingDto) {
        return this.aiService.generateListingDetails(generateListingDto.imageBase64, generateListingDto.userDescription);
    }
    editImage(editImageDto) {
        return this.aiService.editImage(editImageDto.imageBase64, editImageDto.mimeType, editImageDto.prompt);
    }
    analyzeDocument(analyzeDocumentDto) {
        return this.aiService.analyzeDocumentForVerification(analyzeDocumentDto.imageBase64);
    }
    getAnalyticsInsights(analyticsInsightsDto) {
        return this.aiService.getAnalyticsInsights(analyticsInsightsDto.analyticsData);
    }
    getDashboardFocus(dashboardFocusDto) {
        return this.aiService.generateDashboardFocus(dashboardFocusDto.dashboardData);
    }
    processHtml(processHtmlDto) {
        return this.aiService.processImportedHtml(processHtmlDto.html);
    }
    generateCategoryStructure(generateCategoryStructureDto) {
        return this.aiService.generateCategoryStructure(generateCategoryStructureDto.description);
    }
    generateAndSaveSubcategories(generateSubcategoriesDto) {
        return this.aiService.generateAndSaveSubcategories(generateSubcategoriesDto.parentId, generateSubcategoriesDto.parentName);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('generate-listing'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_listing_dto_1.GenerateListingDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "generateListing", null);
__decorate([
    (0, common_1.Post)('edit-image'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [edit_image_dto_1.EditImageDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "editImage", null);
__decorate([
    (0, common_1.Post)('analyze-document'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analyze_document_dto_1.AnalyzeDocumentDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "analyzeDocument", null);
__decorate([
    (0, common_1.Post)('analytics-insights'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [analytics_insights_dto_1.AnalyticsInsightsDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "getAnalyticsInsights", null);
__decorate([
    (0, common_1.Post)('dashboard-focus'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dashboard_focus_dto_1.DashboardFocusDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "getDashboardFocus", null);
__decorate([
    (0, common_1.Post)('process-html'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [process_html_dto_1.ProcessHtmlDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "processHtml", null);
__decorate([
    (0, common_1.Post)('generate-category-structure'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_category_structure_dto_1.GenerateCategoryStructureDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "generateCategoryStructure", null);
__decorate([
    (0, common_1.Post)('generate-and-save-subcategories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_subcategories_dto_1.GenerateSubcategoriesDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "generateAndSaveSubcategories", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], AiController);
//# sourceMappingURL=ai.controller.js.map