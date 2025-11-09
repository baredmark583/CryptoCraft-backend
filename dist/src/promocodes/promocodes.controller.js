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
exports.PromoCodesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const promocodes_service_1 = require("./promocodes.service");
const create_promocode_dto_1 = require("./dto/create-promocode.dto");
const validate_promocode_dto_1 = require("./dto/validate-promocode.dto");
let PromoCodesController = class PromoCodesController {
    constructor(promoCodesService) {
        this.promoCodesService = promoCodesService;
    }
    create(req, createDto) {
        return this.promoCodesService.create(req.user.userId, createDto);
    }
    findBySeller(sellerId) {
        return this.promoCodesService.findBySellerId(sellerId);
    }
    validate(validateDto) {
        return this.promoCodesService.validate(validateDto);
    }
    remove(req, id) {
        return this.promoCodesService.remove(id, req.user.userId);
    }
};
exports.PromoCodesController = PromoCodesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_promocode_dto_1.CreatePromoCodeDto]),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('seller/:sellerId'),
    __param(0, (0, common_1.Param)('sellerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "findBySeller", null);
__decorate([
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [validate_promocode_dto_1.ValidatePromoCodeDto]),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "validate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PromoCodesController.prototype, "remove", null);
exports.PromoCodesController = PromoCodesController = __decorate([
    (0, common_1.Controller)('promocodes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [promocodes_service_1.PromoCodesService])
], PromoCodesController);
//# sourceMappingURL=promocodes.controller.js.map