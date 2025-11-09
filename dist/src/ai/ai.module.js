"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const ai_controller_1 = require("./ai.controller");
const config_1 = require("@nestjs/config");
const gemini_provider_1 = require("./providers/gemini.provider");
const deepseek_provider_1 = require("./providers/deepseek.provider");
const categories_module_1 = require("../categories/categories.module");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, categories_module_1.CategoriesModule],
        controllers: [ai_controller_1.AiController],
        providers: [ai_service_1.AiService, gemini_provider_1.GeminiProvider, deepseek_provider_1.DeepSeekProvider],
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map