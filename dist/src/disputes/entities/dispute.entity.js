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
exports.Dispute = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
let Dispute = class Dispute extends base_entity_1.BaseEntity {
};
exports.Dispute = Dispute;
__decorate([
    (0, typeorm_1.OneToOne)(() => order_entity_1.Order, (order) => order.dispute, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", order_entity_1.Order)
], Dispute.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED_BUYER', 'RESOLVED_SELLER'],
        default: 'OPEN',
    }),
    __metadata("design:type", String)
], Dispute.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { default: [] }),
    __metadata("design:type", Array)
], Dispute.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['LOW', 'NORMAL', 'URGENT'], default: 'NORMAL' }),
    __metadata("design:type", String)
], Dispute.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['LEVEL1', 'LEVEL2', 'SUPERVISOR'], default: 'LEVEL1' }),
    __metadata("design:type", String)
], Dispute.prototype, "assignedTier", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Dispute.prototype, "assignedArbitratorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Dispute.prototype, "responseSlaDueAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Dispute.prototype, "lastAgentResponseAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Dispute.prototype, "slaBreachCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['NONE', 'AUTO_RELEASE', 'AUTO_REFUND', 'AUTO_ESCALATE'], default: 'NONE' }),
    __metadata("design:type", String)
], Dispute.prototype, "pendingAutoAction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Dispute.prototype, "pendingAutoActionAt", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { default: [] }),
    __metadata("design:type", Array)
], Dispute.prototype, "automationLog", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { default: [] }),
    __metadata("design:type", Array)
], Dispute.prototype, "resolutionTemplates", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { default: [] }),
    __metadata("design:type", Array)
], Dispute.prototype, "internalNotes", void 0);
exports.Dispute = Dispute = __decorate([
    (0, typeorm_1.Entity)('disputes')
], Dispute);
//# sourceMappingURL=dispute.entity.js.map