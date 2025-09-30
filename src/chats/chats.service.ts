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
    const userChats = await this.chatRepository.find({
        where: { participants: { id: userId } },
        relations: ['participants'],
    });

    const chatsWithLastMessage = await Promise.all(
        userChats.map(async (chat) => {
            const lastMessage = await this.messageRepository.findOne({
                where: { chat: { id: chat.id } },
                order: { createdAt: 'DESC' },
                relations: ['sender'],
            });
            return { ...chat, lastMessage };
        })
    );
    
    const formattedChats = chatsWithLastMessage.map(chat => {
        const participant = chat.participants.find(p => p && p.id !== userId);
        return {
            id: chat.id,
            participant,
            messages: [],
            lastMessage: chat.lastMessage,
        };
    });
    
    return formattedChats.sort((a,b) => {
        const timeA = a.lastMessage?.createdAt?.getTime() || 0;
        const timeB = b.lastMessage?.createdAt?.getTime() || 0;
        return timeB - timeA;
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
      
      const participant = chat.participants.find(p => p && p.id !== userId);
      
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
    
    // The gateway will now handle real-time notifications.
    // If needed, offline notification logic (like Telegram) could be added here
    // based on user's socket connection status managed by the gateway.

    // Return the full message object with relations
    return this.messageRepository.findOne({
        where: { id: savedMessage.id },
        relations: ['sender', 'productContext', 'chat'],
    });
  }
}