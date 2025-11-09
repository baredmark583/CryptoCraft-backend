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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
const user_entity_1 = require("../users/entities/user.entity");
let NotificationsService = class NotificationsService {
    constructor(notificationRepository, userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }
    async findByUserId(userId) {
        return this.notificationRepository.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
            take: 50,
        });
    }
    async markAllAsRead(userId) {
        await this.notificationRepository.update({ user: { id: userId }, read: false }, { read: true });
    }
    async createPersonalOffer(senderId, recipientId, product, promoCode) {
        const sender = await this.userRepository.findOneBy({ id: senderId });
        const recipient = await this.userRepository.findOneBy({ id: recipientId });
        if (!sender || !recipient)
            throw new common_1.NotFoundException('User not found');
        const discountText = promoCode.discountType === 'PERCENTAGE' ? `${promoCode.discountValue}%` : `${promoCode.discountValue} USDT`;
        const notification = this.notificationRepository.create({
            user: recipient,
            type: 'personal_offer',
            text: `${sender.name} sent you a personal offer of ${discountText} off for "${product.title}"!`,
            link: `/product/${product.id}`,
        });
        return this.notificationRepository.save(notification);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map