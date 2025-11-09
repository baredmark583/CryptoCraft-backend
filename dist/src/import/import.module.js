"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportModule = void 0;
const common_1 = require("@nestjs/common");
const import_service_1 = require("./import.service");
const import_controller_1 = require("./import.controller");
const scraping_module_1 = require("../scraping/scraping.module");
const ai_module_1 = require("../ai/ai.module");
const upload_module_1 = require("../upload/upload.module");
const ai_service_1 = require("../ai/ai.service");
const upload_service_1 = require("../upload/upload.service");
const categories_module_1 = require("../categories/categories.module");
let ImportModule = class ImportModule {
};
exports.ImportModule = ImportModule;
exports.ImportModule = ImportModule = __decorate([
    (0, common_1.Module)({
        imports: [scraping_module_1.ScrapingModule, ai_module_1.AiModule, upload_module_1.UploadModule, categories_module_1.CategoriesModule],
        controllers: [import_controller_1.ImportController],
        providers: [import_service_1.ImportService, ai_service_1.AiService, upload_service_1.UploadService],
    })
], ImportModule);
//# sourceMappingURL=import.module.js.map