import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatsService } from 'src/chats/chats.service';
import { CreateMessageDto } from 'src/chats/dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*', // In a real production app, restrict this to your frontend URL
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');

  constructor(
    private jwtService: JwtService,
    private chatsService: ChatsService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    try {
      const token = client.handshake.query.token as string;
      if (!token) {
        throw new WsException('Authentication token not provided');
      }
      const payload = this.jwtService.verify(token);
      client.data.user = { userId: payload.sub, username: payload.username };
    } catch (e) {
      this.logger.error(`Authentication error: ${e.message}`);
      client.emit('error', 'Authentication failed');
      client.disconnect();
    }
  }

  @SubscribeMessage('joinChat')
  handleJoinRoom(client: Socket, chatId: string): void {
    client.join(chatId);
    this.logger.log(`Client ${client.id} (user: ${client.data.user?.userId}) joined room: ${chatId}`);
  }

  @SubscribeMessage('leaveChat')
  handleLeaveRoom(client: Socket, chatId: string): void {
    client.leave(chatId);
    this.logger.log(`Client ${client.id} left room: ${chatId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { chatId: string; message: CreateMessageDto }): Promise<void> {
    try {
      const userId = client.data.user.userId;
      const message = await this.chatsService.createMessage(payload.chatId, userId, payload.message);
      this.server.to(payload.chatId).emit('newMessage', message);
    } catch(error) {
        this.logger.error(`Error handling message: ${error.message}`);
        client.emit('error', 'Failed to send message.');
    }
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { chatId: string; isTyping: boolean }): void {
    const userId = client.data.user.userId;
    // Broadcast to others in the room
    client.to(payload.chatId).emit('typing', { userId, isTyping: payload.isTyping });
  }
}
