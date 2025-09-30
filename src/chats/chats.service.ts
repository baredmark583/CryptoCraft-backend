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
    const userChats = await this.chatRepository.find({
        where: { participants: { id: userId } },
        relations: ['participants'],
    });

    if (userChats.length === 0) {
        this.logger.log(`User ${userId} has no chats.`);
        return [];
    }

    const chatIds = userChats.map(chat => chat.id);

    // This subquery finds the latest createdAt timestamp for each chat.
    const lastMessageTimestampSubQuery = this.messageRepository
        .createQueryBuilder('msg_sub')
        .select('MAX(msg_sub.createdAt)')
        .where('msg_sub.chatId = message.chatId');

    // This main query fetches the full message entities that match the latest timestamp for each chat.
    const lastMessages = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.sender', 'sender')
        .leftJoinAndSelect('message.chat', 'chat') // We need the chat relation to get chatId
        .where('chat.id IN (:...chatIds)', { chatIds })
        .andWhere(`message.createdAt = (${lastMessageTimestampSubQuery.getQuery()})`)
        .getMany();

    // Map messages by their chat ID for easy lookup.
    const lastMessageMap = new Map<string, Message>();
    lastMessages.forEach(msg => {
        if (msg.chat) {
            lastMessageMap.set(msg.chat.id, msg);
        }
    });

    const formattedChats = userChats
        .map(chat => {
            const otherParticipants = chat.participants?.filter(p => p && p.id !== userId);
            let participant = otherParticipants?.[0];
            
            // If the other participant is missing (e.g., deleted user), create a placeholder.
            if (!participant) {
                this.logger.warn(`Chat ${chat.id} has a missing or invalid participant. Creating a placeholder.`);
                participant = {
                    id: 'deleted-user',
                    name: 'Удаленный пользователь',
                    avatarUrl: 'https://via.placeholder.com/100', // A default avatar
                } as User;
            }

            return {
                id: chat.id,
                participant,
                messages: [],
                lastMessage: lastMessageMap.get(chat.id) || null,
            };
        });

    // Sort by last message timestamp.
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

      const isParticipant = chat.participants.some(p => p && p.id === userId);
      if (!isParticipant) throw new ForbiddenException('You are not a participant in this chat');

      const messages = await this.messageRepository.find({
          where: { chat: { id: chatId } },
          order: { createdAt: 'ASC' },
          relations: ['sender', 'productContext', 'chat'],
      });
      
      const otherParticipants = chat.participants.filter(p => p && p.id !== userId);
      let participant = otherParticipants?.[0];
      
      // If the other participant is missing, create a placeholder.
      if (!participant) {
          this.logger.warn(`Chat ${chatId} has a missing participant in detail view. Using placeholder.`);
          participant = {
              id: 'deleted-user',
              name: 'Удаленный пользователь',
              avatarUrl: 'https://via.placeholder.com/100',
          } as User;
      }
      
      const { participants, ...restOfChat } = chat;
      return { ...restOfChat, messages, participant };
  }

  async createMessage(chatId: string, senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    const chat = await this.chatRepository.findOne({
        where: { id: chatId },
        relations: ['participants'],
    });
    if (!chat) throw new NotFoundException('Chat not found');

    const sender = await this.userRepository.findOneBy({ id: senderId });
    if (!sender) throw new NotFoundException('Sender not found');
    
    const isParticipant = chat.participants.some(p => p.id === senderId);
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
      chat,
      sender,
      productContext,
    });
    const savedMessage = await this.messageRepository.save(newMessage);
    
    // Send offline notification via Telegram
    const recipient = chat.participants.find(p => p.id !== senderId);
    if (recipient) {
        try {
            const messageText = savedMessage.text || (savedMessage.imageUrl ? 'Изображение' : '');
            await this.telegramService.sendNewMessageNotification(recipient, sender, messageText);
        } catch (e) {
            this.logger.error(`Failed to send Telegram notification for new message in chat ${chatId}`, e);
        }
    }


    // Return the full message object with relations for the WebSocket gateway
    return this.messageRepository.findOne({
        where: { id: savedMessage.id },
        relations: ['sender', 'productContext', 'chat'],
    });
  }
}
