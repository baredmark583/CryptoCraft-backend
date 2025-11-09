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
exports.ForumPost = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const forum_thread_entity_1 = require("./forum-thread.entity");
let ForumPost = class ForumPost extends base_entity_1.BaseEntity {
};
exports.ForumPost = ForumPost;
__decorate([
    (0, typeorm_1.ManyToOne)(() => forum_thread_entity_1.ForumThread, (thread) => thread.posts, { onDelete: 'CASCADE' }),
    __metadata("design:type", forum_thread_entity_1.ForumThread)
], ForumPost.prototype, "thread", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.forumPosts, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], ForumPost.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], ForumPost.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ForumPost.prototype, "isHidden", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ForumPost.prototype, "reportCount", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { default: [] }),
    __metadata("design:type", Array)
], ForumPost.prototype, "reportReasons", void 0);
exports.ForumPost = ForumPost = __decorate([
    (0, typeorm_1.Entity)('forum_posts')
], ForumPost);
//# sourceMappingURL=forum-post.entity.js.map