import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class ChatsController {
    private readonly chatsService;
    constructor(chatsService: ChatsService);
    getChatsForUser(req: any): Promise<any[]>;
    findOrCreateChat(req: any, createChatDto: CreateChatDto): Promise<import("./entities/chat.entity").Chat>;
    getChatMessages(id: string, req: any): Promise<any>;
    createMessage(id: string, req: any, createMessageDto: CreateMessageDto): Promise<import("./entities/message.entity").Message>;
}
