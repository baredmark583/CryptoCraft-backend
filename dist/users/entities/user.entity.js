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
exports.User = exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const product_entity_1 = require("../../products/entities/product.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
const review_entity_1 = require("../../reviews/entities/review.entity");
const chat_entity_1 = require("../../chats/entities/chat.entity");
const message_entity_1 = require("../../chats/entities/message.entity");
const collection_entity_1 = require("../../collections/entities/collection.entity");
const workshop_post_entity_1 = require("../../workshop/entities/workshop-post.entity");
const forum_thread_entity_1 = require("../../forum/entities/forum-thread.entity");
const forum_post_entity_1 = require("../../forum/entities/forum-post.entity");
const notification_entity_1 = require("../../notifications/entities/notification.entity");
const promocode_entity_1 = require("../../promocodes/entities/promocode.entity");
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["MODERATOR"] = "MODERATOR";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
let User = class User extends base_entity_1.BaseEntity {
};
exports.User = User;
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', unique: true, nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "telegramId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'default_avatar_url' }),
    __metadata("design:type", String)
], User.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "headerImageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 2,
        scale: 1,
        default: 0,
        transformer: new base_entity_1.DecimalTransformer(),
    }),
    __metadata("design:type", Number)
], User.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { default: [] }),
    __metadata("design:type", Array)
], User.prototype, "following", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        default: 0,
        transformer: new base_entity_1.DecimalTransformer(),
    }),
    __metadata("design:type", Number)
], User.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', {
        precision: 10,
        scale: 2,
        default: 0,
        transformer: new base_entity_1.DecimalTransformer(),
    }),
    __metadata("design:type", Number)
], User.prototype, "commissionOwed", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, unique: true }),
    __metadata("design:type", String)
], User.prototype, "affiliateId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "defaultShippingAddress", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "businessInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "tonWalletAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "paymentCard", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['NONE', 'PRO'],
        default: 'NONE',
    }),
    __metadata("design:type", String)
], User.prototype, "verificationLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "proGrantedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lastProReviewAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_entity_1.Product, (product) => product.seller),
    __metadata("design:type", Array)
], User.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, (order) => order.buyer),
    __metadata("design:type", Array)
], User.prototype, "purchases", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, (order) => order.seller),
    __metadata("design:type", Array)
], User.prototype, "sales", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => review_entity_1.Review, (review) => review.author),
    __metadata("design:type", Array)
], User.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => chat_entity_1.Chat, (chat) => chat.participants),
    __metadata("design:type", Array)
], User.prototype, "chats", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (message) => message.sender),
    __metadata("design:type", Array)
], User.prototype, "sentMessages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => collection_entity_1.Collection, (collection) => collection.user),
    __metadata("design:type", Array)
], User.prototype, "collections", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => workshop_post_entity_1.WorkshopPost, (post) => post.seller),
    __metadata("design:type", Array)
], User.prototype, "workshopPosts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => forum_thread_entity_1.ForumThread, (thread) => thread.author),
    __metadata("design:type", Array)
], User.prototype, "forumThreads", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => forum_post_entity_1.ForumPost, (post) => post.author),
    __metadata("design:type", Array)
], User.prototype, "forumPosts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification.user),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => promocode_entity_1.PromoCode, (promoCode) => promoCode.seller),
    __metadata("design:type", Array)
], User.prototype, "promoCodes", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map