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
exports.NovaPoshtaController = void 0;
const common_1 = require("@nestjs/common");
const nova_poshta_service_1 = require("./nova-poshta.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let NovaPoshtaController = class NovaPoshtaController {
    constructor(novaPoshtaService) {
        this.novaPoshtaService = novaPoshtaService;
    }
    async getCities(search) {
        const response = await this.novaPoshtaService.findCities(search);
        return { data: response.data || [] };
    }
    async getWarehouses(cityRef, search) {
        const response = await this.novaPoshtaService.findWarehouses(cityRef, search);
        return { data: response.data || [] };
    }
};
exports.NovaPoshtaController = NovaPoshtaController;
__decorate([
    (0, common_1.Get)('cities'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NovaPoshtaController.prototype, "getCities", null);
__decorate([
    (0, common_1.Get)('warehouses'),
    __param(0, (0, common_1.Query)('cityRef')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NovaPoshtaController.prototype, "getWarehouses", null);
exports.NovaPoshtaController = NovaPoshtaController = __decorate([
    (0, common_1.Controller)('nova-poshta'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [nova_poshta_service_1.NovaPoshtaService])
], NovaPoshtaController);
//# sourceMappingURL=nova-poshta.controller.js.map