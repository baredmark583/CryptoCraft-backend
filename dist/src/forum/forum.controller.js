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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForumController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const forum_service_1 = require("./forum.service");
const create_forum_thread_dto_1 = require("./dto/create-forum-thread.dto");
const create_forum_post_dto_1 = require("./dto/create-forum-post.dto");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const pin_thread_dto_1 = require("./dto/pin-thread.dto");
const update_thread_moderation_dto_1 = require("./dto/update-thread-moderation.dto");
const report_forum_post_dto_1 = require("./dto/report-forum-post.dto");
let ForumController = class ForumController {
    constructor(forumService) {
        this.forumService = forumService;
    }
    createThread(req, createDto) {
        return this.forumService.createThread(req.user.userId, createDto);
    }
    getAllThreads(page = '1', limit = '20', search, tag, pinnedOnly) {
        return this.forumService.findAllThreads({
            page: Number(page),
            limit: Number(limit),
            search,
            tag,
            pinnedOnly: pinnedOnly === 'true',
        });
    }
    getThreadById(id) {
        return this.forumService.findThreadById(id);
    }
    getPostsByThreadId(id, page = '1', limit = '25') {
        return this.forumService.findPostsByThreadId(id, Number(page), Number(limit));
    }
    createPost(req, id, createDto) {
        return this.forumService.createPost(req.user.userId, id, createDto);
    }
    pinThread(id, dto) {
        return this.forumService.pinThread(id, dto);
    }
    updateThreadStatus(id, dto) {
        return this.forumService.updateThreadStatus(id, dto);
    }
    reportPost(req, postId, dto) {
        return this.forumService.reportPost(postId, req.user.userId, dto);
    }
};
exports.ForumController = ForumController;
__decorate([
    (0, common_1.Post)('threads'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_forum_thread_dto_1.CreateForumThreadDto]),
    __metadata("design:returntype", void 0)
], ForumController.prototype, "createThread", null);
__decorate([
    (0, common_1.Get)('threads'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('tag')),
    __param(4, (0, common_1.Query)('pinnedOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ForumController.prototype, "getAllThreads", null);
__decorate([
    (0, common_1.Get)('threads/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ForumController.prototype, "getThreadById", null);
__decorate([
    (0, common_1.Get)('threads/:id/posts'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ForumController.prototype, "getPostsByThreadId", null);
__decorate([
    (0, common_1.Post)('threads/:id/posts'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_forum_post_dto_1.CreateForumPostDto]),
    __metadata("design:returntype", void 0)
], ForumController.prototype, "createPost", null);
__decorate([
    (0, common_1.Patch)('threads/:id/pin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.MODERATOR, user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pin_thread_dto_1.PinThreadDto]),
    __metadata("design:returntype", void 0)
], ForumController.prototype, "pinThread", null);
__decorate([
    (0, common_1.Patch)('threads/:id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.MODERATOR, user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_thread_moderation_dto_1.UpdateThreadModerationDto]),
    __metadata("design:returntype", void 0)
], ForumController.prototype, "updateThreadStatus", null);
__decorate([
    (0, common_1.Post)('posts/:postId/report'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('postId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, report_forum_post_dto_1.ReportForumPostDto]),
    __metadata("design:returntype", void 0)
], ForumController.prototype, "reportPost", null);
exports.ForumController = ForumController = __decorate([
    (0, common_1.Controller)('forum'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [forum_service_1.ForumService])
], ForumController);
//# sourceMappingURL=forum.controller.js.map