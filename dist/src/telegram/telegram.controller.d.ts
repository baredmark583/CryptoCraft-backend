import { TelegramService } from './telegram.service';
import { UsersService } from 'src/users/users.service';
import { SendMessageDto } from './dto/send-message.dto';
import { BroadcastDto } from './dto/broadcast.dto';
export declare class TelegramController {
    private readonly telegramService;
    private readonly usersService;
    constructor(telegramService: TelegramService, usersService: UsersService);
    sendMessageToUser(sendMessageDto: SendMessageDto): Promise<{
        success: boolean;
        message: string;
    }>;
    broadcastMessage(broadcastDto: BroadcastDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
