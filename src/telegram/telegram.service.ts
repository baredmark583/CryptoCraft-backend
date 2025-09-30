import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class TelegramService {
  private readonly botToken: string;
  private readonly apiUrl: string;
  private readonly logger = new Logger(TelegramService.name);

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  async sendMessage(chatId: number, text: string): Promise<void> {
    if (!this.botToken) {
        this.logger.warn('TELEGRAM_BOT_TOKEN is not configured. Skipping message sending.');
        return;
    }
    try {
      await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      });
      this.logger.log(`Message sent to chat ID: ${chatId}`);
    } catch (error) {
      this.logger.error(`Failed to send message to chat ID ${chatId}:`, error.response?.data || error.message);
    }
  }

  async sendNewOrderNotification(seller: User, buyer: User, orderId: string, total: number) {
    if (seller.telegramId) {
        const message = `🎉 *Новый заказ!* 🎉\n\nПоздравляем, у вас новый заказ #${orderId.slice(-6)} от покупателя *${buyer.name}* на сумму *${total.toFixed(2)} USDT*.\n\nПожалуйста, подготовьте товар к отправке.`;
        await this.sendMessage(seller.telegramId, message);
    }
  }

  async sendNewMessageNotification(recipient: User, sender: User, messageText: string) {
    if (recipient.telegramId) {
        const truncatedText = messageText.length > 100 ? `${messageText.substring(0, 100)}...` : messageText;
        const message = `📬 *Новое сообщение* от *${sender.name}*:\n\n${truncatedText}`;
        await this.sendMessage(recipient.telegramId, message);
    }
  }
}