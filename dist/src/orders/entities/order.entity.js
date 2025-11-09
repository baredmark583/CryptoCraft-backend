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
exports.Order = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const order_item_entity_1 = require("./order-item.entity");
const dispute_entity_1 = require("../../disputes/entities/dispute.entity");
const escrow_transaction_entity_1 = require("../../escrow/entities/escrow-transaction.entity");
let Order = class Order extends base_entity_1.BaseEntity {
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.purchases, { eager: true, onDelete: 'SET NULL', nullable: true }),
    __metadata("design:type", user_entity_1.User)
], Order.prototype, "buyer", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.sales, { eager: true, onDelete: 'SET NULL', nullable: true }),
    __metadata("design:type", user_entity_1.User)
], Order.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_item_entity_1.OrderItem, (item) => item.order, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        transformer: new base_entity_1.DecimalTransformer(),
    }),
    __metadata("design:type", Number)
], Order.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [
            'PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'DISPUTED', 'COMPLETED', 'CANCELLED',
        ],
        default: 'PENDING',
    }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { transformer: { from: (value) => parseInt(value, 10), to: (value) => value } }),
    __metadata("design:type", Number)
], Order.prototype, "orderDate", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Order.prototype, "shippingAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['NOVA_POSHTA', 'UKRPOSHTA', 'MEETUP'],
        default: 'NOVA_POSHTA',
    }),
    __metadata("design:type", String)
], Order.prototype, "shippingMethod", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Order.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "trackingNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Order.prototype, "transactionHash", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => dispute_entity_1.Dispute, (dispute) => dispute.order, { cascade: true, eager: true, nullable: true }),
    __metadata("design:type", dispute_entity_1.Dispute)
], Order.prototype, "dispute", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['CART', 'DEPOSIT'],
        default: 'CART',
    }),
    __metadata("design:type", String)
], Order.prototype, "checkoutMode", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        transformer: new base_entity_1.DecimalTransformer(),
        nullable: true,
    }),
    __metadata("design:type", Number)
], Order.prototype, "depositAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Order.prototype, "meetingDetails", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => escrow_transaction_entity_1.EscrowTransaction, (escrow) => escrow.order, {
        eager: true,
        nullable: true,
    }),
    __metadata("design:type", escrow_transaction_entity_1.EscrowTransaction)
], Order.prototype, "escrow", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)('orders')
], Order);
//# sourceMappingURL=order.entity.js.map