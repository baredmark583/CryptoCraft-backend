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
exports.EscrowTransaction = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const escrow_event_entity_1 = require("./escrow-event.entity");
let EscrowTransaction = class EscrowTransaction extends base_entity_1.BaseEntity {
};
exports.EscrowTransaction = EscrowTransaction;
__decorate([
    (0, typeorm_1.OneToOne)(() => order_entity_1.Order, (order) => order.escrow, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", order_entity_1.Order)
], EscrowTransaction.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true, onDelete: 'SET NULL', nullable: true }),
    __metadata("design:type", user_entity_1.User)
], EscrowTransaction.prototype, "buyer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true, onDelete: 'SET NULL', nullable: true }),
    __metadata("design:type", user_entity_1.User)
], EscrowTransaction.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 12,
        scale: 2,
        transformer: new base_entity_1.DecimalTransformer(),
    }),
    __metadata("design:type", Number)
], EscrowTransaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['USDT'],
        default: 'USDT',
    }),
    __metadata("design:type", String)
], EscrowTransaction.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['TON'],
        default: 'TON',
    }),
    __metadata("design:type", String)
], EscrowTransaction.prototype, "network", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [
            'AWAITING_PAYMENT',
            'PENDING_CONFIRMATION',
            'FUNDED',
            'RELEASED',
            'REFUNDED',
            'PARTIALLY_REFUNDED',
            'CANCELLED',
            'DISPUTED',
        ],
        default: 'AWAITING_PAYMENT',
    }),
    __metadata("design:type", String)
], EscrowTransaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['CART', 'DEPOSIT'],
        default: 'CART',
    }),
    __metadata("design:type", String)
], EscrowTransaction.prototype, "escrowType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EscrowTransaction.prototype, "depositTransactionHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EscrowTransaction.prototype, "releaseTransactionHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], EscrowTransaction.prototype, "refundTransactionHash", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { default: {} }),
    __metadata("design:type", Object)
], EscrowTransaction.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => escrow_event_entity_1.EscrowEvent, (event) => event.escrow, { cascade: true }),
    __metadata("design:type", Array)
], EscrowTransaction.prototype, "events", void 0);
exports.EscrowTransaction = EscrowTransaction = __decorate([
    (0, typeorm_1.Entity)('escrow_transactions')
], EscrowTransaction);
//# sourceMappingURL=escrow-transaction.entity.js.map