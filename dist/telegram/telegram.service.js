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
var TelegramService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let TelegramService = TelegramService_1 = class TelegramService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(TelegramService_1.name);
        this.botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
        this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
    }
    async sendMessage(chatId, text) {
        if (!this.botToken) {
            this.logger.warn('TELEGRAM_BOT_TOKEN is not configured. Skipping message sending.');
            return;
        }
        try {
            await axios_1.default.post(`${this.apiUrl}/sendMessage`, {
                chat_id: chatId,
                text,
                parse_mode: 'Markdown',
            });
            this.logger.log(`Message sent to chat ID: ${chatId}`);
        }
        catch (error) {
            this.logger.error(`Failed to send message to chat ID ${chatId}:`, error.response?.data || error.message);
        }
    }
    async sendNewOrderNotification(seller, buyer, orderId, total) {
        if (seller.telegramId) {
            const message = `🎉 *Новый заказ!* 🎉\n\nПоздравляем, у вас новый заказ #${orderId.slice(-6)} от покупателя *${buyer.name}* на сумму *${total.toFixed(2)} USDT*.\n\nПожалуйста, подготовьте товар к отправке.`;
            await this.sendMessage(seller.telegramId, message);
        }
    }
    async sendNewMessageNotification(recipient, sender, messageText) {
        if (recipient.telegramId) {
            const content = messageText ? messageText : 'Отправлено изображение';
            const truncatedText = content.length > 100 ? `${content.substring(0, 100)}...` : content;
            const message = `📬 *Новое сообщение* от *${sender.name}*:\n\n_${truncatedText}_`;
            await this.sendMessage(recipient.telegramId, message);
        }
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = TelegramService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map