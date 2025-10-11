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
import { UserRole } from 'src/users/entities/user.entity';

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
      // We store the whole decoded payload which includes the role
      client.data.user = payload; 
    } catch (e) {
      this.logger.error(`Authentication error: ${e.message}`);
      client.emit('error', 'Authentication failed');
      client.disconnect();
    }
  }

  @SubscribeMessage('joinChat')
  handleJoinRoom(client: Socket, chatId: string): void {
    client.join(chatId);
    this.logger.log(`Client ${client.id} (user: ${client.data.user?.sub}) joined room: ${chatId}`);
  }

  @SubscribeMessage('leaveChat')
  handleLeaveRoom(client: Socket, chatId: string): void {
    client.leave(chatId);
    this.logger.log(`Client ${client.id} left room: ${chatId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { chatId: string; message: CreateMessageDto }): Promise<void> {
    try {
      const userId = client.data.user.sub;
      const isLiveStreamChat = !payload.chatId.includes('-'); // Simple check: UUIDs for chats have dashes, stream IDs might not. This is a heuristic.
      
      let message;
      // Only save to DB if it's a regular chat, not a live stream
      if (isLiveStreamChat) {
         message = {
            id: `msg-live-${Date.now()}`,
            text: payload.message.text,
            imageUrl: payload.message.imageUrl,
            sender: { id: userId, name: client.data.user.username }, // Send partial user data
            chat: { id: payload.chatId },
            createdAt: new Date(),
         };
      } else {
        message = await this.chatsService.createMessage(payload.chatId, userId, payload.message);
      }
      
      this.server.to(payload.chatId).emit('newMessage', message);
    } catch(error) {
        this.logger.error(`Error handling message: ${error.message}`);
        client.emit('error', 'Failed to send message.');
    }
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { chatId: string; isTyping: boolean }): void {
    const userId = client.data.user.sub;
    // Broadcast to others in the room
    client.to(payload.chatId).emit('typing', { userId, isTyping: payload.isTyping });
  }

  @SubscribeMessage('deleteMessage')
  handleDeleteMessage(client: Socket, payload: { roomId: string; messageId: string }): void {
    const user = client.data.user;
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.MODERATOR) {
      this.logger.warn(`User ${user.sub} attempted to delete a message without permission.`);
      return;
    }
    
    this.logger.log(`Moderator ${user.sub} deleting message ${payload.messageId} from room ${payload.roomId}`);
    this.server.to(payload.roomId).emit('messageDeleted', { messageId: payload.messageId });
  }
  
  @SubscribeMessage('streamEndedBroadcast')
  handleStreamEnded(client: Socket, payload: { roomId: string }): void {
      const user = client.data.user;
       if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.MODERATOR) {
        this.logger.warn(`User ${user.sub} attempted to broadcast stream end without permission.`);
        return;
      }
      this.logger.log(`Moderator ${user.sub} ending stream for room ${payload.roomId}`);
      // Broadcast to everyone in the room *including the sender*
      this.server.to(payload.roomId).emit('streamEnded');
  }
}