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
exports.Vote = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const proposal_entity_1 = require("./proposal.entity");
let Vote = class Vote extends base_entity_1.BaseEntity {
};
exports.Vote = Vote;
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true }),
    __metadata("design:type", user_entity_1.User)
], Vote.prototype, "voter", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => proposal_entity_1.Proposal, (proposal) => proposal.votes, { onDelete: 'CASCADE' }),
    __metadata("design:type", proposal_entity_1.Proposal)
], Vote.prototype, "proposal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['FOR', 'AGAINST'] }),
    __metadata("design:type", String)
], Vote.prototype, "choice", void 0);
exports.Vote = Vote = __decorate([
    (0, typeorm_1.Entity)('votes')
], Vote);
//# sourceMappingURL=vote.entity.js.map