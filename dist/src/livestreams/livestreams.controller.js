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
exports.LivestreamsController = void 0;
const common_1 = require("@nestjs/common");
const livestreams_service_1 = require("./livestreams.service");
const create_livestream_dto_1 = require("./dto/create-livestream.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const jwt_1 = require("@nestjs/jwt");
const flag_livestream_dto_1 = require("./dto/flag-livestream.dto");
const attach_recording_dto_1 = require("./dto/attach-recording.dto");
let LivestreamsController = class LivestreamsController {
    constructor(livestreamsService, jwtService) {
        this.livestreamsService = livestreamsService;
        this.jwtService = jwtService;
    }
    create(req, createLivestreamDto) {
        return this.livestreamsService.create(req.user.userId, createLivestreamDto);
    }
    findAll() {
        return this.livestreamsService.findAll();
    }
    findOne(id) {
        return this.livestreamsService.findOne(id);
    }
    async generateToken(req, id) {
        let user = null;
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const payload = this.jwtService.verify(token);
                user = { userId: payload.sub, username: payload.username };
            }
            catch (e) {
                user = null;
            }
        }
        const token = await this.livestreamsService.generateJoinToken(id, user);
        return { token };
    }
    endStream(req, id) {
        return this.livestreamsService.endStream(id, req.user.userId, req.user.role);
    }
    async flagStream(req, id, dto) {
        let reporterId = null;
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const payload = this.jwtService.verify(token);
                reporterId = payload.sub;
            }
            catch {
                reporterId = null;
            }
        }
        await this.livestreamsService.flagLivestream(id, reporterId, dto);
        return { status: 'ok' };
    }
    attachRecording(req, id, dto) {
        return this.livestreamsService.attachRecording(id, dto, req.user.userId);
    }
    getAnalytics(req, id) {
        return this.livestreamsService.getAnalytics(id, { id: req.user.userId, role: req.user.role });
    }
};
exports.LivestreamsController = LivestreamsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_livestream_dto_1.CreateLivestreamDto]),
    __metadata("design:returntype", void 0)
], LivestreamsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LivestreamsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LivestreamsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/token'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LivestreamsController.prototype, "generateToken", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id/end'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LivestreamsController.prototype, "endStream", null);
__decorate([
    (0, common_1.Post)(':id/report'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, flag_livestream_dto_1.FlagLivestreamDto]),
    __metadata("design:returntype", Promise)
], LivestreamsController.prototype, "flagStream", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/recording'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, attach_recording_dto_1.AttachRecordingDto]),
    __metadata("design:returntype", void 0)
], LivestreamsController.prototype, "attachRecording", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/analytics'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LivestreamsController.prototype, "getAnalytics", null);
exports.LivestreamsController = LivestreamsController = __decorate([
    (0, common_1.Controller)('livestreams'),
    __metadata("design:paramtypes", [livestreams_service_1.LivestreamsService,
        jwt_1.JwtService])
], LivestreamsController);
//# sourceMappingURL=livestreams.controller.js.map