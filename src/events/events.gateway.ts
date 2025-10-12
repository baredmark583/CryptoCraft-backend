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
import { InjectRepository } from '@nestjs/typeorm';
import { Livestream } from 'src/livestreams/entities/livestream.entity';
import { Repository } from 'typeorm';

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
    @InjectRepository(Livestream)
    private readonly livestreamRepository: Repository<Livestream>,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const streamId = client.data.streamId;
    if (streamId) {
        // Use a timeout to give a moment for potential reconnection and avoid flickering viewer counts
        setTimeout(() => this.broadcastStreamStats(streamId), 1000);
    }
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    try {
      const token = client.handshake.query.token as string;
      if (!token || token === 'null' || token === 'undefined') {
        throw new Error('Authentication token not provided');
      }
      const payload = this.jwtService.verify(token);
      // We store the whole decoded payload which includes the role
      client.data.user = payload;
    } catch (e) {
      this.logger.log(`Authentication failed for client ${client.id}: ${e.message}. Treating as guest.`);
      // Assign a guest identity instead of disconnecting
      client.data.user = {
        sub: `guest:${client.id}`,
        username: `Guest#${Math.floor(Math.random() * 1000)}`,
        role: 'GUEST', // Custom role for identification
      };
    }
  }
  
  private async broadcastStreamStats(streamId: string) {
    const room = this.server.sockets.adapter.rooms.get(streamId);
    const viewerCount = room ? room.size : 0;
    
    const stream = await this.livestreamRepository.findOneBy({ id: streamId });
    if (!stream) {
        this.logger.warn(`broadcastStreamStats: Stream with ID ${streamId} not found.`);
        return;
    }
    
    // Update viewer count in DB
    await this.livestreamRepository.update(streamId, { viewerCount });

    this.server.to(streamId).emit('streamUpdate', { viewers: viewerCount, likes: stream.likes });
    this.logger.log(`Broadcasting stats for ${streamId}: ${viewerCount} viewers, ${stream.likes} likes`);
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
      if (!payload || !payload.chatId) {
        throw new WsException('Chat not found');
      }
      const userId = client.data.user.sub;
      if (userId.startsWith('guest:')) {
        throw new WsException('Guests cannot send messages in private chats.');
      }
      const message = await this.chatsService.createMessage(payload.chatId, userId, payload.message);
      this.server.to(payload.chatId).emit('newMessage', message);
    } catch (error) {
      this.logger.error(`Error handling message: ${error.message}`);
      client.emit('error', new WsException(error.message || 'Failed to send message.'));
    }
  }

  @SubscribeMessage('sendStreamMessage')
  handleStreamMessage(client: Socket, payload: { streamId: string; message: { text?: string; imageUrl?: string } }): void {
    try {
      const user = client.data.user;
      if (!user) {
        throw new WsException('No user data on socket.');
      }

      const message = {
        id: `msg-live-${Date.now()}-${Math.random()}`,
        text: payload.message.text,
        imageUrl: payload.message.imageUrl,
        sender: {
          id: user.sub,
          name: user.username,
          avatarUrl: user.avatarUrl,
        },
        chat: { id: payload.streamId },
        timestamp: Date.now(),
      };

      this.server.to(payload.streamId).emit('newMessage', message);
    } catch (error) {
      this.logger.error(`Error handling stream message: ${error.message}`);
      client.emit('error', new WsException('Failed to send stream message.'));
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

  @SubscribeMessage('joinStreamRoom')
  handleJoinStreamRoom(client: Socket, streamId: string): void {
    client.join(streamId);
    client.data.streamId = streamId;
    this.logger.log(`Client ${client.id} (user: ${client.data.user?.sub}) joined stream room: ${streamId}`);
    this.broadcastStreamStats(streamId);
  }

  @SubscribeMessage('leaveStreamRoom')
  handleLeaveStreamRoom(client: Socket, streamId: string): void {
    client.leave(streamId);
    delete client.data.streamId;
    this.logger.log(`Client ${client.id} left stream room: ${streamId}`);
    this.broadcastStreamStats(streamId);
  }

  @SubscribeMessage('likeStream')
  async handleLikeStream(client: Socket, streamId: string): Promise<void> {
    try {
      await this.livestreamRepository.increment({ id: streamId }, 'likes', 1);
      const stream = await this.livestreamRepository.findOneBy({ id: streamId });
      if (stream) {
        const room = this.server.sockets.adapter.rooms.get(streamId);
        const viewerCount = room ? room.size : 0;
        this.server.to(streamId).emit('streamUpdate', { viewers: viewerCount, likes: stream.likes });
      }
    } catch (error) {
        this.logger.error(`Error handling like for stream ${streamId}: ${error.message}`);
    }
  }

  @SubscribeMessage('streamEndedBroadcast')
  handleStreamEnded(client: Socket, payload: { roomId: string }): void {
    const user = client.data.user;
    // We should check if the user is the owner of the stream too.
    // For now, only admin/moderator check is present.
    if (user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.MODERATOR) {
      this.logger.warn(`User ${user.sub} attempted to broadcast stream end without permission.`);
      return;
    }
    this.logger.log(`Moderator ${user.sub} ending stream for room ${payload.roomId}`);
    // Broadcast to everyone in the room *including the sender*
    this.server.to(payload.roomId).emit('streamEnded');
  }
}