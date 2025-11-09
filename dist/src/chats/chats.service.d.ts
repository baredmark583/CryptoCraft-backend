import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { TelegramService } from '../telegram/telegram.service';
import { Product } from '../products/entities/product.entity';
export declare class ChatsService {
    private readonly chatRepository;
    private readonly messageRepository;
    private readonly userRepository;
    private readonly productRepository;
    private readonly telegramService;
    private readonly logger;
    constructor(chatRepository: Repository<Chat>, messageRepository: Repository<Message>, userRepository: Repository<User>, productRepository: Repository<Product>, telegramService: TelegramService);
    getChats(userId: string): Promise<any[]>;
    findOrCreateChat(userId1: string, userId2: string): Promise<Chat>;
    getChatWithMessages(chatId: string, userId: string): Promise<any>;
    createMessage(chatId: string, senderId: string, createMessageDto: CreateMessageDto): Promise<Message>;
    markMessagesAsRead(chatId: string, userId: string, preloadMessages?: Message[]): Promise<{
        messageId: string;
        readAt: Date;
    }[]>;
    private getUnreadCountMap;
}
