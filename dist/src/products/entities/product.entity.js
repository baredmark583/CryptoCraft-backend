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
exports.Product = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const order_item_entity_1 = require("../../orders/entities/order-item.entity");
const message_entity_1 = require("../../chats/entities/message.entity");
const review_entity_1 = require("../../reviews/entities/review.entity");
const product_moderation_event_entity_1 = require("./product-moderation-event.entity");
const product_revision_entity_1 = require("./product-revision.entity");
let Product = class Product extends base_entity_1.BaseEntity {
};
exports.Product = Product;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        nullable: true,
        transformer: new base_entity_1.DecimalTransformer(),
    }),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        nullable: true,
        transformer: new base_entity_1.DecimalTransformer(),
    }),
    __metadata("design:type", Number)
], Product.prototype, "salePrice", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array'),
    __metadata("design:type", Array)
], Product.prototype, "imageUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "videoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.products, {
        eager: true,
        onDelete: 'SET NULL',
        nullable: true,
    }),
    __metadata("design:type", user_entity_1.User)
], Product.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { default: {} }),
    __metadata("design:type", Object)
], Product.prototype, "dynamicAttributes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Product.prototype, "stock", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Array)
], Product.prototype, "variants", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Array)
], Product.prototype, "variantAttributes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Product.prototype, "isPromoted", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "uniqueness", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "productType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "digitalFileUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Product.prototype, "giftWrapAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        nullable: true,
        transformer: new base_entity_1.DecimalTransformer(),
    }),
    __metadata("design:type", Number)
], Product.prototype, "giftWrapPrice", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        nullable: true,
        transformer: new base_entity_1.DecimalTransformer(),
    }),
    __metadata("design:type", Number)
], Product.prototype, "purchaseCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Product.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Product.prototype, "isB2BEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Product.prototype, "b2bMinQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        nullable: true,
        transformer: new base_entity_1.DecimalTransformer(),
    }),
    __metadata("design:type", Number)
], Product.prototype, "b2bPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "turnaroundTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "serviceLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Product.prototype, "warrantyDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "serialNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Product.prototype, "isAuction", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { nullable: true }),
    __metadata("design:type", Number)
], Product.prototype, "auctionEnds", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        nullable: true,
        transformer: new base_entity_1.DecimalTransformer(),
    }),
    __metadata("design:type", Number)
], Product.prototype, "startingBid", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        nullable: true,
        transformer: new base_entity_1.DecimalTransformer(),
    }),
    __metadata("design:type", Number)
], Product.prototype, "currentBid", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Product.prototype, "bidders", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "winnerId", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        nullable: true,
        transformer: new base_entity_1.DecimalTransformer(),
    }),
    __metadata("design:type", Number)
], Product.prototype, "finalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Product.prototype, "isAuthenticationAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['NONE', 'PENDING', 'AUTHENTICATED', 'REJECTED'],
        default: 'NONE',
    }),
    __metadata("design:type", String)
], Product.prototype, "authenticationStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "authenticationReportUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "nftTokenId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "nftContractAddress", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_item_entity_1.OrderItem, (orderItem) => orderItem.product),
    __metadata("design:type", Array)
], Product.prototype, "orderItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (message) => message.productContext),
    __metadata("design:type", Array)
], Product.prototype, "messageContexts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_entity_1.Review, (review) => review.product),
    __metadata("design:type", Array)
], Product.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['Pending Moderation', 'Active', 'Rejected'],
        default: 'Pending Moderation',
    }),
    __metadata("design:type", String)
], Product.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "appealMessage", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", user_entity_1.User)
], Product.prototype, "moderatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Product.prototype, "moderatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_moderation_event_entity_1.ProductModerationEvent, (event) => event.product, { cascade: true }),
    __metadata("design:type", Array)
], Product.prototype, "moderationEvents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_revision_entity_1.ProductRevision, (revision) => revision.product, { cascade: true }),
    __metadata("design:type", Array)
], Product.prototype, "revisions", void 0);
exports.Product = Product = __decorate([
    (0, typeorm_1.Entity)()
], Product);
//# sourceMappingURL=product.entity.js.map