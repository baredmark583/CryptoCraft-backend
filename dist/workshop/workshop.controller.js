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
exports.WorkshopController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const workshop_service_1 = require("./workshop.service");
const create_workshop_post_dto_1 = require("./dto/create-workshop-post.dto");
const create_workshop_comment_dto_1 = require("./dto/create-workshop-comment.dto");
const report_workshop_content_dto_1 = require("./dto/report-workshop-content.dto");
const moderate_workshop_content_dto_1 = require("./dto/moderate-workshop-content.dto");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let WorkshopController = class WorkshopController {
    constructor(workshopService) {
        this.workshopService = workshopService;
    }
    createPost(req, createPostDto) {
        return this.workshopService.createPost(req.user.userId, createPostDto);
    }
    getPostsBySeller(sellerId) {
        return this.workshopService.getPostsBySellerId(sellerId);
    }
    getFeed(req) {
        return this.workshopService.getFeedForUser(req.user.userId);
    }
    likePost(req, postId) {
        return this.workshopService.likePost(postId, req.user.userId);
    }
    addComment(req, postId, createCommentDto) {
        return this.workshopService.addComment(postId, req.user.userId, createCommentDto);
    }
    reportPost(req, postId, dto) {
        return this.workshopService.reportPost(postId, req.user.userId, dto);
    }
    reportComment(req, commentId, dto) {
        return this.workshopService.reportComment(commentId, req.user.userId, dto);
    }
    listFlaggedPosts(limit = '20', offset = '0') {
        return this.workshopService.listFlaggedPosts(Number(limit), Number(offset));
    }
    listFlaggedComments(limit = '20', offset = '0') {
        return this.workshopService.listFlaggedComments(Number(limit), Number(offset));
    }
    moderatePost(req, postId, dto) {
        return this.workshopService.moderatePost(postId, dto, req.user.userId);
    }
    moderateComment(commentId, dto) {
        return this.workshopService.moderateComment(commentId, dto);
    }
};
exports.WorkshopController = WorkshopController;
__decorate([
    (0, common_1.Post)('posts'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_workshop_post_dto_1.CreateWorkshopPostDto]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "createPost", null);
__decorate([
    (0, common_1.Get)('posts/user/:sellerId'),
    __param(0, (0, common_1.Param)('sellerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "getPostsBySeller", null);
__decorate([
    (0, common_1.Get)('feed'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "getFeed", null);
__decorate([
    (0, common_1.Post)('posts/:postId/like'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('postId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "likePost", null);
__decorate([
    (0, common_1.Post)('posts/:postId/comments'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('postId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_workshop_comment_dto_1.CreateWorkshopCommentDto]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "addComment", null);
__decorate([
    (0, common_1.Post)('posts/:postId/report'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('postId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, report_workshop_content_dto_1.ReportWorkshopContentDto]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "reportPost", null);
__decorate([
    (0, common_1.Post)('comments/:commentId/report'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('commentId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, report_workshop_content_dto_1.ReportWorkshopContentDto]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "reportComment", null);
__decorate([
    (0, common_1.Get)('moderation/posts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.MODERATOR, user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "listFlaggedPosts", null);
__decorate([
    (0, common_1.Get)('moderation/comments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.MODERATOR, user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "listFlaggedComments", null);
__decorate([
    (0, common_1.Patch)('posts/:postId/moderate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.MODERATOR, user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('postId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, moderate_workshop_content_dto_1.ModerateWorkshopContentDto]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "moderatePost", null);
__decorate([
    (0, common_1.Patch)('comments/:commentId/moderate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.MODERATOR, user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('commentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, moderate_workshop_content_dto_1.ModerateWorkshopContentDto]),
    __metadata("design:returntype", void 0)
], WorkshopController.prototype, "moderateComment", null);
exports.WorkshopController = WorkshopController = __decorate([
    (0, common_1.Controller)('workshop'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [workshop_service_1.WorkshopService])
], WorkshopController);
//# sourceMappingURL=workshop.controller.js.map