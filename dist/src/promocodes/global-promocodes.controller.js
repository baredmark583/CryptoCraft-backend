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
exports.GlobalPromoCodesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const audit_interceptor_1 = require("../common/interceptors/audit.interceptor");
const global_promocodes_service_1 = require("./global-promocodes.service");
const create_global_promocode_dto_1 = require("./dto/create-global-promocode.dto");
const update_global_promocode_dto_1 = require("./dto/update-global-promocode.dto");
let GlobalPromoCodesController = class GlobalPromoCodesController {
    constructor(globalPromoCodesService) {
        this.globalPromoCodesService = globalPromoCodesService;
    }
    findAll() {
        return this.globalPromoCodesService.findAll();
    }
    create(dto, req) {
        return this.globalPromoCodesService.create(dto, req.user?.userId);
    }
    update(id, dto, req) {
        return this.globalPromoCodesService.update(id, dto, req.user?.userId);
    }
    remove(id) {
        return this.globalPromoCodesService.remove(id);
    }
};
exports.GlobalPromoCodesController = GlobalPromoCodesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GlobalPromoCodesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_global_promocode_dto_1.CreateGlobalPromoCodeDto, Object]),
    __metadata("design:returntype", void 0)
], GlobalPromoCodesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_global_promocode_dto_1.UpdateGlobalPromoCodeDto, Object]),
    __metadata("design:returntype", void 0)
], GlobalPromoCodesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GlobalPromoCodesController.prototype, "remove", null);
exports.GlobalPromoCodesController = GlobalPromoCodesController = __decorate([
    (0, common_1.Controller)('global-promocodes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    (0, common_1.UseInterceptors)(audit_interceptor_1.AuditInterceptor),
    __metadata("design:paramtypes", [global_promocodes_service_1.GlobalPromoCodesService])
], GlobalPromoCodesController);
//# sourceMappingURL=global-promocodes.controller.js.map