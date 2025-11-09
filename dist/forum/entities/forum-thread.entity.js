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
exports.ForumThread = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const forum_post_entity_1 = require("./forum-post.entity");
let ForumThread = class ForumThread extends base_entity_1.BaseEntity {
};
exports.ForumThread = ForumThread;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ForumThread.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.forumThreads, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], ForumThread.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => forum_post_entity_1.ForumPost, (post) => post.thread),
    __metadata("design:type", Array)
], ForumThread.prototype, "posts", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ForumThread.prototype, "replyCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], ForumThread.prototype, "lastReplyAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ForumThread.prototype, "isPinned", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['OPEN', 'LOCKED'],
        default: 'OPEN',
    }),
    __metadata("design:type", String)
], ForumThread.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, default: '{}' }),
    __metadata("design:type", Array)
], ForumThread.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ForumThread.prototype, "viewCount", void 0);
exports.ForumThread = ForumThread = __decorate([
    (0, typeorm_1.Entity)('forum_threads')
], ForumThread);
//# sourceMappingURL=forum-thread.entity.js.map