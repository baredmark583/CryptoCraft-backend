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
exports.GovernanceController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const governance_service_1 = require("./governance.service");
const create_proposal_dto_1 = require("./dto/create-proposal.dto");
const cast_vote_dto_1 = require("./dto/cast-vote.dto");
const roles_guard_1 = require("../auth/guards/roles.guard");
const user_entity_1 = require("../users/entities/user.entity");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const update_proposal_dto_1 = require("./dto/update-proposal.dto");
let GovernanceController = class GovernanceController {
    constructor(governanceService) {
        this.governanceService = governanceService;
    }
    createProposal(req, createDto) {
        return this.governanceService.createProposal(req.user.userId, createDto);
    }
    getAllProposals() {
        return this.governanceService.findAllProposals();
    }
    getAllProposalsForAdmin() {
        return this.governanceService.findAllForAdmin();
    }
    getProposalById(id) {
        return this.governanceService.findProposalById(id);
    }
    castVote(req, id, castVoteDto) {
        return this.governanceService.castVote(id, req.user.userId, castVoteDto);
    }
    updateProposal(id, updateDto) {
        return this.governanceService.update(id, updateDto);
    }
    removeProposal(id) {
        return this.governanceService.remove(id);
    }
};
exports.GovernanceController = GovernanceController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_proposal_dto_1.CreateProposalDto]),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "createProposal", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "getAllProposals", null);
__decorate([
    (0, common_1.Get)('/admin'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "getAllProposalsForAdmin", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "getProposalById", null);
__decorate([
    (0, common_1.Post)(':id/vote'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, cast_vote_dto_1.CastVoteDto]),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "castVote", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_proposal_dto_1.UpdateProposalDto]),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "updateProposal", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GovernanceController.prototype, "removeProposal", null);
exports.GovernanceController = GovernanceController = __decorate([
    (0, common_1.Controller)('governance/proposals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [governance_service_1.GovernanceService])
], GovernanceController);
//# sourceMappingURL=governance.controller.js.map