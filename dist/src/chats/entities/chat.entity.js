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
exports.Chat = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../../database/base.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const message_entity_1 = require("./message.entity");
let Chat = class Chat extends base_entity_1.BaseEntity {
};
exports.Chat = Chat;
__decorate([
    (0, typeorm_1.ManyToMany)(() => user_entity_1.User, (user) => user.chats, { eager: true }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Chat.prototype, "participants", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (message) => message.chat, { cascade: true }),
    __metadata("design:type", Array)
], Chat.prototype, "messages", void 0);
exports.Chat = Chat = __decorate([
    (0, typeorm_1.Entity)('chats')
], Chat);
//# sourceMappingURL=chat.entity.js.map