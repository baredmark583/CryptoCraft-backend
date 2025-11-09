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
exports.CollectionsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const collections_service_1 = require("./collections.service");
const create_collection_dto_1 = require("./dto/create-collection.dto");
const add_product_dto_1 = require("./dto/add-product.dto");
let CollectionsController = class CollectionsController {
    constructor(collectionsService) {
        this.collectionsService = collectionsService;
    }
    create(req, createDto) {
        return this.collectionsService.create(req.user.userId, createDto);
    }
    findByUser(req) {
        return this.collectionsService.findByUserId(req.user.userId);
    }
    findOne(req, id) {
        return this.collectionsService.findOne(id, req.user.userId);
    }
    addProduct(req, id, addProductDto) {
        return this.collectionsService.addProduct(id, addProductDto.productId, req.user.userId);
    }
    removeProduct(req, id, productId) {
        return this.collectionsService.removeProduct(id, productId, req.user.userId);
    }
};
exports.CollectionsController = CollectionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_collection_dto_1.CreateCollectionDto]),
    __metadata("design:returntype", void 0)
], CollectionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CollectionsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CollectionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/products'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, add_product_dto_1.AddProductDto]),
    __metadata("design:returntype", void 0)
], CollectionsController.prototype, "addProduct", null);
__decorate([
    (0, common_1.Delete)(':id/products/:productId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('productId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], CollectionsController.prototype, "removeProduct", null);
exports.CollectionsController = CollectionsController = __decorate([
    (0, common_1.Controller)('collections'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [collections_service_1.CollectionsService])
], CollectionsController);
//# sourceMappingURL=collections.controller.js.map