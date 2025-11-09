import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { TelegramService } from '../telegram/telegram.service';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);

  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly telegramService: TelegramService,
  ) {}

  async getChats(userId: string): Promise<any[]> {
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

    const lastMessageMap = new Map<string, Message>();
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

    return (formattedChats as any[]).sort((a, b) => {
      const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });
  }

  async findOrCreateChat(userId1: string, userId2: string): Promise<Chat> {
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
      throw new NotFoundException('One or more users not found');
    }

    const newChat = this.chatRepository.create({
      participants: [user1, user2],
    });

    return this.chatRepository.save(newChat);
  }
  
  async getChatWithMessages(chatId: string, userId: string): Promise<any> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['participants'],
    });

    if (!chat) throw new NotFoundException('Chat not found');

    const isParticipant = chat.participants.some((p) => p && p.id === userId);
    if (!isParticipant) throw new ForbiddenException('You are not a participant in this chat');

    const messages = await this.messageRepository.find({
      where: { chat: { id: chatId } },
      order: { createdAt: 'ASC' },
      relations: ['sender', 'productContext', 'chat'],
    });

    await this.markMessagesAsRead(chatId, userId, messages);

    const participant = chat.participants.find((p) => p && p.id !== userId);

    const targetParticipant =
      participant || ({
        id: 'deleted-user',
        name: 'Удалённый пользователь',
        avatarUrl: 'https://picsum.photos/seed/deleted-user/100',
      } as User);

    const unreadCountMap = await this.getUnreadCountMap([chat.id], userId);
    const { participants, ...restOfChat } = chat;
    return {
      ...restOfChat,
      messages,
      participant: targetParticipant,
      unreadCount: unreadCountMap.get(chat.id) ?? 0,
    };
  }

  async createMessage(chatId: string, senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['participants'],
    });
    if (!chat) throw new NotFoundException('Chat not found');

    const sender = await this.userRepository.findOneBy({ id: senderId });
    if (!sender) throw new NotFoundException('Sender not found');

    const isParticipant = chat.participants.some((p) => p.id === senderId);
    if (!isParticipant) throw new ForbiddenException('You are not a participant in this chat');

    let productContext: Product | undefined = undefined;
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
        const messageText =
          savedMessage.text ||
          (savedMessage.attachments?.some((att) => att.type === 'image')
            ? 'Изображение'
            : savedMessage.attachments?.length
            ? 'Вложение'
            : '');
        await this.telegramService.sendNewMessageNotification(recipient, sender, messageText);
      } catch (e) {
        this.logger.error(`Failed to send Telegram notification for new message in chat ${chatId}`, e);
      }
    }

    return this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender', 'productContext', 'chat'],
    });
  }

  async markMessagesAsRead(
    chatId: string,
    userId: string,
    preloadMessages?: Message[],
  ): Promise<{ messageId: string; readAt: Date }[]> {
    const messages =
      preloadMessages ??
      (await this.messageRepository.find({
        where: { chat: { id: chatId } },
        order: { createdAt: 'ASC' },
        relations: ['chat'],
      }));

    const updated: { messageId: string; readAt: Date }[] = [];
    const now = new Date();

    await Promise.all(
      messages.map(async (message) => {
        const alreadyRead = (message.readReceipts || []).some((receipt) => receipt.userId === userId);
        if (alreadyRead) return;
        message.readReceipts = [...(message.readReceipts || []), { userId, readAt: now }];
        await this.messageRepository.save(message);
        updated.push({ messageId: message.id, readAt: now });
      }),
    );

    return updated;
  }

  private async getUnreadCountMap(chatIds: string[], userId: string) {
    if (!chatIds.length) {
      return new Map<string, number>();
    }

    const rows = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.chat', 'chat')
      .select('chat.id', 'chatId')
      .addSelect('COUNT(message.id)', 'unread')
      .where('chat.id IN (:...chatIds)', { chatIds })
      .andWhere(
        `NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(coalesce(message.readReceipts, '[]'::jsonb)) elem
          WHERE elem->>'userId' = :userId
        )`,
        { userId },
      )
      .groupBy('chat.id')
      .getRawMany();

    return new Map<string, number>(rows.map((row) => [row.chatId, Number(row.unread)]));
  }
}
