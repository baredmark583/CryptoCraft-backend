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
exports.WorkshopPost = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const workshop_comment_entity_1 = require("./workshop-comment.entity");
let WorkshopPost = class WorkshopPost extends base_entity_1.BaseEntity {
};
exports.WorkshopPost = WorkshopPost;
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], WorkshopPost.prototype, "seller", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], WorkshopPost.prototype, "text", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WorkshopPost.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_entity_1.User, { eager: true, cascade: true }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], WorkshopPost.prototype, "likedBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => workshop_comment_entity_1.WorkshopComment, (comment) => comment.post, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], WorkshopPost.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['PUBLISHED', 'FLAGGED', 'HIDDEN'],
        default: 'PUBLISHED',
    }),
    __metadata("design:type", String)
], WorkshopPost.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], WorkshopPost.prototype, "reportCount", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { default: [] }),
    __metadata("design:type", Array)
], WorkshopPost.prototype, "reportReasons", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], WorkshopPost.prototype, "lastReportedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WorkshopPost.prototype, "moderationNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], WorkshopPost.prototype, "commentsLocked", void 0);
exports.WorkshopPost = WorkshopPost = __decorate([
    (0, typeorm_1.Entity)('workshop_posts')
], WorkshopPost);
//# sourceMappingURL=workshop-post.entity.js.map