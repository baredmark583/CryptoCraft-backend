import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatsService } from 'src/chats/chats.service';
import { CreateMessageDto } from 'src/chats/dto/create-message.dto';
import { Livestream } from 'src/livestreams/entities/livestream.entity';
import { Repository } from 'typeorm';
import { LivestreamsService } from 'src/livestreams/livestreams.service';
export declare class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private chatsService;
    private readonly livestreamRepository;
    private readonly livestreamsService;
    server: Server;
    private logger;
    constructor(jwtService: JwtService, chatsService: ChatsService, livestreamRepository: Repository<Livestream>, livestreamsService: LivestreamsService);
    afterInit(server: Server): void;
    handleDisconnect(client: Socket): void;
    handleConnection(client: Socket): Promise<void>;
    private broadcastStreamStats;
    handleJoinRoom(client: Socket, chatId: string): void;
    handleLeaveRoom(client: Socket, chatId: string): void;
    handleMessage(client: Socket, payload: {
        chatId: string;
        message: CreateMessageDto;
    }): Promise<void>;
    handleMarkAsRead(client: Socket, payload: {
        chatId: string;
    }): Promise<void>;
    handleStreamMessage(client: Socket, payload: {
        streamId: string;
        message: {
            text?: string;
            imageUrl?: string;
        };
    }): void;
    handleTyping(client: Socket, payload: {
        chatId: string;
        isTyping: boolean;
    }): void;
    handleDeleteMessage(client: Socket, payload: {
        roomId: string;
        messageId: string;
    }): void;
    handleJoinStreamRoom(client: Socket, streamId: string): void;
    handleLeaveStreamRoom(client: Socket, streamId: string): void;
    handleLikeStream(client: Socket, streamId: string): Promise<void>;
    handleStreamEnded(client: Socket, payload: {
        roomId: string;
    }): void;
    private getSocketUserId;
}
