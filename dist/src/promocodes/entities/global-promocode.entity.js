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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalPromoCode = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
let GlobalPromoCode = class GlobalPromoCode extends base_entity_1.BaseEntity {
};
exports.GlobalPromoCode = GlobalPromoCode;
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], GlobalPromoCode.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['PERCENTAGE', 'FIXED_AMOUNT'] }),
    __metadata("design:type", String)
], GlobalPromoCode.prototype, "discountType", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, transformer: new base_entity_1.DecimalTransformer() }),
    __metadata("design:type", Number)
], GlobalPromoCode.prototype, "discountValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], GlobalPromoCode.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GlobalPromoCode.prototype, "uses", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GlobalPromoCode.prototype, "maxUses", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, nullable: true, transformer: new base_entity_1.DecimalTransformer() }),
    __metadata("design:type", Number)
], GlobalPromoCode.prototype, "minPurchaseAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], GlobalPromoCode.prototype, "validFrom", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], GlobalPromoCode.prototype, "validUntil", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GlobalPromoCode.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GlobalPromoCode.prototype, "updatedBy", void 0);
exports.GlobalPromoCode = GlobalPromoCode = __decorate([
    (0, typeorm_1.Entity)('global_promocodes')
], GlobalPromoCode);
//# sourceMappingURL=global-promocode.entity.js.map