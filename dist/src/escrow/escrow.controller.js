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
exports.EscrowController = void 0;
const common_1 = require("@nestjs/common");
const escrow_service_1 = require("./escrow.service");
const fund_escrow_dto_1 = require("./dto/fund-escrow.dto");
const release_escrow_dto_1 = require("./dto/release-escrow.dto");
const refund_escrow_dto_1 = require("./dto/refund-escrow.dto");
const ton_webhook_dto_1 = require("./dto/ton-webhook.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let EscrowController = class EscrowController {
    constructor(escrowService) {
        this.escrowService = escrowService;
    }
    getByOrder(orderId) {
        return this.escrowService.findByOrder(orderId);
    }
    markFunded(orderId, dto, req) {
        return this.escrowService.markFunded(orderId, dto, {
            userId: req.user?.id,
            role: req.user?.role || 'USER',
        });
    }
    releaseFunds(orderId, dto, req) {
        return this.escrowService.markReleased(orderId, dto, {
            userId: req.user?.id,
            role: req.user?.role || 'ADMIN',
        });
    }
    refund(orderId, dto, req) {
        return this.escrowService.markRefunded(orderId, dto, {
            userId: req.user?.id,
            role: req.user?.role || 'ADMIN',
        });
    }
    handleTonWebhook(dto) {
        return this.escrowService.handleTonWebhook(dto);
    }
};
exports.EscrowController = EscrowController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('orders/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EscrowController.prototype, "getByOrder", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('orders/:orderId/fund'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, fund_escrow_dto_1.FundEscrowDto, Object]),
    __metadata("design:returntype", void 0)
], EscrowController.prototype, "markFunded", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('orders/:orderId/release'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, release_escrow_dto_1.ReleaseEscrowDto, Object]),
    __metadata("design:returntype", void 0)
], EscrowController.prototype, "releaseFunds", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('orders/:orderId/refund'),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, refund_escrow_dto_1.RefundEscrowDto, Object]),
    __metadata("design:returntype", void 0)
], EscrowController.prototype, "refund", null);
__decorate([
    (0, common_1.Post)('webhooks/ton'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ton_webhook_dto_1.TonWebhookDto]),
    __metadata("design:returntype", void 0)
], EscrowController.prototype, "handleTonWebhook", null);
exports.EscrowController = EscrowController = __decorate([
    (0, common_1.Controller)('escrow'),
    __metadata("design:paramtypes", [escrow_service_1.EscrowService])
], EscrowController);
//# sourceMappingURL=escrow.controller.js.map