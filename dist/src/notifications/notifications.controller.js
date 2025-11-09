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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const notifications_service_1 = require("./notifications.service");
const products_service_1 = require("../products/products.service");
const promocodes_service_1 = require("../promocodes/promocodes.service");
const personal_offer_dto_1 = require("./dto/personal-offer.dto");
let NotificationsController = class NotificationsController {
    constructor(notificationsService, productsService, promoCodesService) {
        this.notificationsService = notificationsService;
        this.productsService = productsService;
        this.promoCodesService = promoCodesService;
    }
    getNotifications(req) {
        return this.notificationsService.findByUserId(req.user.userId);
    }
    markAllAsRead(req) {
        return this.notificationsService.markAllAsRead(req.user.userId);
    }
    async sendPersonalOffer(req, offerDto) {
        const product = await this.productsService.findOne(offerDto.productId);
        const promoCode = await this.promoCodesService.findOne(offerDto.promoId, req.user.userId);
        return this.notificationsService.createPersonalOffer(req.user.userId, offerDto.recipientId, product, promoCode);
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Post)('read'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Post)('personal-offer'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, personal_offer_dto_1.PersonalOfferDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendPersonalOffer", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        products_service_1.ProductsService,
        promocodes_service_1.PromoCodesService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map