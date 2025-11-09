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
exports.WorkshopComment = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const workshop_post_entity_1 = require("./workshop-post.entity");
let WorkshopComment = class WorkshopComment extends base_entity_1.BaseEntity {
};
exports.WorkshopComment = WorkshopComment;
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], WorkshopComment.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], WorkshopComment.prototype, "text", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workshop_post_entity_1.WorkshopPost, (post) => post.comments, { onDelete: 'CASCADE' }),
    __metadata("design:type", workshop_post_entity_1.WorkshopPost)
], WorkshopComment.prototype, "post", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['VISIBLE', 'HIDDEN'],
        default: 'VISIBLE',
    }),
    __metadata("design:type", String)
], WorkshopComment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], WorkshopComment.prototype, "reportCount", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { default: [] }),
    __metadata("design:type", Array)
], WorkshopComment.prototype, "reportReasons", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], WorkshopComment.prototype, "lastReportedAt", void 0);
exports.WorkshopComment = WorkshopComment = __decorate([
    (0, typeorm_1.Entity)('workshop_comments')
], WorkshopComment);
//# sourceMappingURL=workshop-comment.entity.js.map