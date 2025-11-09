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
exports.TelegramController = void 0;
const common_1 = require("@nestjs/common");
const telegram_service_1 = require("./telegram.service");
const users_service_1 = require("../users/users.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const send_message_dto_1 = require("./dto/send-message.dto");
const broadcast_dto_1 = require("./dto/broadcast.dto");
let TelegramController = class TelegramController {
    constructor(telegramService, usersService) {
        this.telegramService = telegramService;
        this.usersService = usersService;
    }
    async sendMessageToUser(sendMessageDto) {
        const user = await this.usersService.findOne(sendMessageDto.userId);
        if (user && user.telegramId) {
            await this.telegramService.sendMessage(user.telegramId, sendMessageDto.message);
            return { success: true, message: `Message sent to ${user.name}.` };
        }
        return { success: false, message: 'User not found or has no Telegram ID.' };
    }
    async broadcastMessage(broadcastDto) {
        const users = await this.usersService.findAll();
        const telegramUsers = users.filter(u => u.telegramId);
        telegramUsers.forEach(user => {
            this.telegramService.sendMessage(user.telegramId, broadcastDto.message);
        });
        return { success: true, message: `Broadcast started to ${telegramUsers.length} users.` };
    }
};
exports.TelegramController = TelegramController;
__decorate([
    (0, common_1.Post)('send-message'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "sendMessageToUser", null);
__decorate([
    (0, common_1.Post)('broadcast'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [broadcast_dto_1.BroadcastDto]),
    __metadata("design:returntype", Promise)
], TelegramController.prototype, "broadcastMessage", null);
exports.TelegramController = TelegramController = __decorate([
    (0, common_1.Controller)('telegram'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.SUPER_ADMIN),
    __metadata("design:paramtypes", [telegram_service_1.TelegramService,
        users_service_1.UsersService])
], TelegramController);
//# sourceMappingURL=telegram.controller.js.map