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
exports.UpdateDisputeDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class DisputeMessageDto {
}
class DisputeResolutionTemplateDto {
}
class DisputeInternalNoteDto {
}
class UpdateDisputeDto {
}
exports.UpdateDisputeDto = UpdateDisputeDto;
__decorate([
    (0, class_validator_1.IsEnum)(['OPEN', 'UNDER_REVIEW', 'RESOLVED_BUYER', 'RESOLVED_SELLER']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDisputeDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DisputeMessageDto),
    __metadata("design:type", Array)
], UpdateDisputeDto.prototype, "messages", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['LOW', 'NORMAL', 'URGENT']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDisputeDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['LEVEL1', 'LEVEL2', 'SUPERVISOR']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDisputeDto.prototype, "assignedTier", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDisputeDto.prototype, "assignedArbitratorId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDisputeDto.prototype, "responseSlaDueAt", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['NONE', 'AUTO_RELEASE', 'AUTO_REFUND', 'AUTO_ESCALATE']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDisputeDto.prototype, "pendingAutoAction", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDisputeDto.prototype, "pendingAutoActionAt", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DisputeResolutionTemplateDto),
    __metadata("design:type", Array)
], UpdateDisputeDto.prototype, "resolutionTemplates", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DisputeInternalNoteDto),
    __metadata("design:type", Array)
], UpdateDisputeDto.prototype, "internalNotes", void 0);
//# sourceMappingURL=update-dispute.dto.js.map