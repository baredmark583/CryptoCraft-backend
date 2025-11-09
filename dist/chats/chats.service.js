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
var ChatsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_entity_1 = require("./entities/chat.entity");
const message_entity_1 = require("./entities/message.entity");
const user_entity_1 = require("../users/entities/user.entity");
const telegram_service_1 = require("../telegram/telegram.service");
const product_entity_1 = require("../products/entities/product.entity");
let ChatsService = ChatsService_1 = class ChatsService {
    constructor(chatRepository, messageRepository, userRepository, productRepository, telegramService) {
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.telegramService = telegramService;
        this.logger = new common_1.Logger(ChatsService_1.name);
    }
    async getChats(userId) {
        this.logger.log(`Fetching chats for user ${userId}`);
        const userChats = await this.chatRepository
            .createQueryBuilder('chat')
            .leftJoinAndSelect('chat.participants', 'participant')
            .innerJoin('chat.participants', 'user', 'user.id = :userId', { userId })
            .getMany();
        if (userChats.length === 0) {
            this.logger.log(`User ${userId} has no chats.`);
            return [];
        }
        const chatIds = userChats.map((chat) => chat.id);
        const lastMessageTimestampSubQuery = this.messageRepository
            .createQueryBuilder('msg_sub')
            .select('MAX(msg_sub.createdAt)')
            .where('msg_sub.chatId = message.chatId');
        const lastMessages = await this.messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('message.productContext', 'productContext')
            .leftJoinAndSelect('message.chat', 'chat')
            .where('chat.id IN (:...chatIds)', { chatIds })
            .andWhere(`message.createdAt = (${lastMessageTimestampSubQuery.getQuery()})`)
            .getMany();
        const lastMessageMap = new Map();
        lastMessages.forEach((msg) => {
            if (msg.chat) {
                lastMessageMap.set(msg.chat.id, msg);
            }
        });
        const unreadCountMap = await this.getUnreadCountMap(chatIds, userId);
        const formattedChats = userChats.map((chat) => {
            const participant = chat.participants?.find((p) => p && p.id !== userId);
            if (!participant) {
                this.logger.warn(`Chat ${chat.id} has a missing or invalid participant. Creating a placeholder.`);
                return {
                    id: chat.id,
                    participant: {
                        id: 'deleted-user',
                        name: 'Удалённый пользователь',
                        avatarUrl: 'https://picsum.photos/seed/deleted-user/100',
                    },
                    messages: [],
                    lastMessage: lastMessageMap.get(chat.id) || null,
                    unreadCount: unreadCountMap.get(chat.id) ?? 0,
                };
            }
            return {
                id: chat.id,
                participant,
                messages: [],
                lastMessage: lastMessageMap.get(chat.id) || null,
                unreadCount: unreadCountMap.get(chat.id) ?? 0,
            };
        });
        return formattedChats.sort((a, b) => {
            const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
        });
    }
    async findOrCreateChat(userId1, userId2) {
        const chat = await this.chatRepository
            .createQueryBuilder('chat')
            .innerJoin('chat.participants', 'p1')
            .innerJoin('chat.participants', 'p2')
            .where('p1.id = :userId1', { userId1 })
            .andWhere('p2.id = :userId2', { userId2 })
            .getOne();
        if (chat) {
            return chat;
        }
        const user1 = await this.userRepository.findOneBy({ id: userId1 });
        const user2 = await this.userRepository.findOneBy({ id: userId2 });
        if (!user1 || !user2) {
            throw new common_1.NotFoundException('One or more users not found');
        }
        const newChat = this.chatRepository.create({
            participants: [user1, user2],
        });
        return this.chatRepository.save(newChat);
    }
    async getChatWithMessages(chatId, userId) {
        const chat = await this.chatRepository.findOne({
            where: { id: chatId },
            relations: ['participants'],
        });
        if (!chat)
            throw new common_1.NotFoundException('Chat not found');
        const isParticipant = chat.participants.some((p) => p && p.id === userId);
        if (!isParticipant)
            throw new common_1.ForbiddenException('You are not a participant in this chat');
        const messages = await this.messageRepository.find({
            where: { chat: { id: chatId } },
            order: { createdAt: 'ASC' },
            relations: ['sender', 'productContext', 'chat'],
        });
        await this.markMessagesAsRead(chatId, userId, messages);
        const participant = chat.participants.find((p) => p && p.id !== userId);
        const targetParticipant = participant || {
            id: 'deleted-user',
            name: 'Удалённый пользователь',
            avatarUrl: 'https://picsum.photos/seed/deleted-user/100',
        };
        const unreadCountMap = await this.getUnreadCountMap([chat.id], userId);
        const { participants, ...restOfChat } = chat;
        return {
            ...restOfChat,
            messages,
            participant: targetParticipant,
            unreadCount: unreadCountMap.get(chat.id) ?? 0,
        };
    }
    async createMessage(chatId, senderId, createMessageDto) {
        const chat = await this.chatRepository.findOne({
            where: { id: chatId },
            relations: ['participants'],
        });
        if (!chat)
            throw new common_1.NotFoundException('Chat not found');
        const sender = await this.userRepository.findOneBy({ id: senderId });
        if (!sender)
            throw new common_1.NotFoundException('Sender not found');
        const isParticipant = chat.participants.some((p) => p.id === senderId);
        if (!isParticipant)
            throw new common_1.ForbiddenException('You are not a participant in this chat');
        let productContext = undefined;
        if (createMessageDto.productContext?.id) {
            productContext = await this.productRepository.findOneBy({ id: createMessageDto.productContext.id });
            if (!productContext) {
                this.logger.warn(`Product context with id ${createMessageDto.productContext.id} not found.`);
            }
        }
        const newMessage = this.messageRepository.create({
            text: createMessageDto.text,
            imageUrl: createMessageDto.imageUrl,
            attachments: createMessageDto.attachments ?? [],
            quickReplies: createMessageDto.quickReplies ?? [],
            readReceipts: [
                {
                    userId: senderId,
                    readAt: new Date(),
                },
            ],
            chat,
            sender,
            productContext,
        });
        const savedMessage = await this.messageRepository.save(newMessage);
        const recipient = chat.participants.find((p) => p.id !== senderId);
        if (recipient) {
            try {
                const messageText = savedMessage.text ||
                    (savedMessage.attachments?.some((att) => att.type === 'image')
                        ? 'Изображение'
                        : savedMessage.attachments?.length
                            ? 'Вложение'
                            : '');
                await this.telegramService.sendNewMessageNotification(recipient, sender, messageText);
            }
            catch (e) {
                this.logger.error(`Failed to send Telegram notification for new message in chat ${chatId}`, e);
            }
        }
        return this.messageRepository.findOne({
            where: { id: savedMessage.id },
            relations: ['sender', 'productContext', 'chat'],
        });
    }
    async markMessagesAsRead(chatId, userId, preloadMessages) {
        const messages = preloadMessages ??
            (await this.messageRepository.find({
                where: { chat: { id: chatId } },
                order: { createdAt: 'ASC' },
                relations: ['chat'],
            }));
        const updated = [];
        const now = new Date();
        await Promise.all(messages.map(async (message) => {
            const alreadyRead = (message.readReceipts || []).some((receipt) => receipt.userId === userId);
            if (alreadyRead)
                return;
            message.readReceipts = [...(message.readReceipts || []), { userId, readAt: now }];
            await this.messageRepository.save(message);
            updated.push({ messageId: message.id, readAt: now });
        }));
        return updated;
    }
    async getUnreadCountMap(chatIds, userId) {
        if (!chatIds.length) {
            return new Map();
        }
        const rows = await this.messageRepository
            .createQueryBuilder('message')
            .leftJoin('message.chat', 'chat')
            .select('chat.id', 'chatId')
            .addSelect('COUNT(message.id)', 'unread')
            .where('chat.id IN (:...chatIds)', { chatIds })
            .andWhere(`NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(coalesce(message.readReceipts, '[]'::jsonb)) elem
          WHERE elem->>'userId' = :userId
        )`, { userId })
            .groupBy('chat.id')
            .getRawMany();
        return new Map(rows.map((row) => [row.chatId, Number(row.unread)]));
    }
};
exports.ChatsService = ChatsService;
exports.ChatsService = ChatsService = ChatsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_entity_1.Chat)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        telegram_service_1.TelegramService])
], ChatsService);
//# sourceMappingURL=chats.service.js.map