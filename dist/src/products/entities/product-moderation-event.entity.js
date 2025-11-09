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
exports.ProductModerationEvent = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const product_entity_1 = require("./product.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let ProductModerationEvent = class ProductModerationEvent extends base_entity_1.BaseEntity {
};
exports.ProductModerationEvent = ProductModerationEvent;
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, (product) => product.moderationEvents, { onDelete: 'CASCADE' }),
    __metadata("design:type", product_entity_1.Product)
], ProductModerationEvent.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", user_entity_1.User)
], ProductModerationEvent.prototype, "moderator", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProductModerationEvent.prototype, "moderatorId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['SUBMITTED', 'APPROVED', 'REJECTED', 'APPEALED', 'REOPENED'],
    }),
    __metadata("design:type", String)
], ProductModerationEvent.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], ProductModerationEvent.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['Pending Moderation', 'Active', 'Rejected'],
        nullable: true,
    }),
    __metadata("design:type", String)
], ProductModerationEvent.prototype, "previousStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['Pending Moderation', 'Active', 'Rejected'],
        nullable: true,
    }),
    __metadata("design:type", String)
], ProductModerationEvent.prototype, "nextStatus", void 0);
exports.ProductModerationEvent = ProductModerationEvent = __decorate([
    (0, typeorm_1.Entity)('product_moderation_events')
], ProductModerationEvent);
//# sourceMappingURL=product-moderation-event.entity.js.map