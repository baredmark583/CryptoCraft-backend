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
exports.EscrowEvent = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const escrow_transaction_entity_1 = require("./escrow-transaction.entity");
let EscrowEvent = class EscrowEvent extends base_entity_1.BaseEntity {
};
exports.EscrowEvent = EscrowEvent;
__decorate([
    (0, typeorm_1.ManyToOne)(() => escrow_transaction_entity_1.EscrowTransaction, (escrow) => escrow.events, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", escrow_transaction_entity_1.EscrowTransaction)
], EscrowEvent.prototype, "escrow", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['STATUS_CHANGE', 'PAYMENT_DETECTED', 'WEBHOOK', 'MANUAL_ACTION', 'NOTE'],
        default: 'NOTE',
    }),
    __metadata("design:type", String)
], EscrowEvent.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EscrowEvent.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], EscrowEvent.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EscrowEvent.prototype, "performedByUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EscrowEvent.prototype, "performedByRole", void 0);
exports.EscrowEvent = EscrowEvent = __decorate([
    (0, typeorm_1.Entity)('escrow_events')
], EscrowEvent);
//# sourceMappingURL=escrow-event.entity.js.map