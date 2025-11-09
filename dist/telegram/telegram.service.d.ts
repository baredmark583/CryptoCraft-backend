import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
export declare class TelegramService {
    private configService;
    private readonly botToken;
    private readonly apiUrl;
    private readonly logger;
    constructor(configService: ConfigService);
    sendMessage(chatId: number, text: string): Promise<void>;
    sendNewOrderNotification(seller: User, buyer: User, orderId: string, total: number): Promise<void>;
    sendNewMessageNotification(recipient: User, sender: User, messageText: string): Promise<void>;
}
