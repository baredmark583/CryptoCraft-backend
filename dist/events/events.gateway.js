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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const chats_service_1 = require("../chats/chats.service");
const user_entity_1 = require("../users/entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const livestream_entity_1 = require("../livestreams/entities/livestream.entity");
const typeorm_2 = require("typeorm");
const livestreams_service_1 = require("../livestreams/livestreams.service");
let EventsGateway = class EventsGateway {
    constructor(jwtService, chatsService, livestreamRepository, livestreamsService) {
        this.jwtService = jwtService;
        this.chatsService = chatsService;
        this.livestreamRepository = livestreamRepository;
        this.livestreamsService = livestreamsService;
        this.logger = new common_1.Logger('EventsGateway');
    }
    afterInit(server) {
        this.logger.log('WebSocket Gateway Initialized');
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        const streamId = client.data.streamId;
        if (streamId) {
            setTimeout(() => this.broadcastStreamStats(streamId), 1000);
        }
    }
    async handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        try {
            const token = client.handshake.auth.token;
            if (!token || token === 'null' || token === 'undefined') {
                throw new Error('Authentication token not provided');
            }
            const payload = this.jwtService.verify(token);
            client.data.user = payload;
        }
        catch (e) {
            this.logger.log(`Authentication failed for client ${client.id}: ${e.message}. Treating as guest.`);
            client.data.user = {
                sub: `guest:${client.id}`,
                username: `Guest#${Math.floor(Math.random() * 1000)}`,
                role: 'GUEST',
            };
        }
    }
    async broadcastStreamStats(streamId) {
        const room = this.server.sockets.adapter.rooms.get(streamId);
        const viewerCount = room ? room.size : 0;
        const stream = await this.livestreamRepository.findOneBy({ id: streamId });
        if (!stream) {
            this.logger.warn(`broadcastStreamStats: Stream with ID ${streamId} not found.`);
            return;
        }
        await this.livestreamsService.recordViewerSnapshot(streamId, viewerCount);
        this.server.to(streamId).emit('streamUpdate', { viewers: viewerCount, likes: stream.likes });
        this.logger.log(`Broadcasting stats for ${streamId}: ${viewerCount} viewers, ${stream.likes} likes`);
    }
    handleJoinRoom(client, chatId) {
        client.join(chatId);
        this.logger.log(`Client ${client.id} (user: ${client.data.user?.sub}) joined room: ${chatId}`);
    }
    handleLeaveRoom(client, chatId) {
        client.leave(chatId);
        this.logger.log(`Client ${client.id} left room: ${chatId}`);
    }
    async handleMessage(client, payload) {
        try {
            if (!payload || !payload.chatId) {
                throw new websockets_1.WsException('Chat not found');
            }
            const userId = this.getSocketUserId(client);
            if (userId.startsWith('guest:')) {
                throw new websockets_1.WsException('Guests cannot send messages in private chats.');
            }
            const message = await this.chatsService.createMessage(payload.chatId, userId, payload.message);
            this.server.to(payload.chatId).emit('newMessage', message);
        }
        catch (error) {
            this.logger.error(`Error handling message: ${error.message}`);
            client.emit('error', new websockets_1.WsException(error.message || 'Failed to send message.'));
        }
    }
    async handleMarkAsRead(client, payload) {
        try {
            if (!payload?.chatId) {
                throw new websockets_1.WsException('Chat not found');
            }
            const userId = this.getSocketUserId(client);
            const updatedReceipts = await this.chatsService.markMessagesAsRead(payload.chatId, userId);
            if (updatedReceipts.length) {
                this.server.to(payload.chatId).emit('messagesRead', {
                    chatId: payload.chatId,
                    userId,
                    receipts: updatedReceipts,
                });
            }
        }
        catch (error) {
            this.logger.error(`Error handling markAsRead: ${error.message}`);
            client.emit('error', new websockets_1.WsException(error.message || 'Failed to mark messages as read.'));
        }
    }
    handleStreamMessage(client, payload) {
        try {
            const user = client.data.user;
            if (!user) {
                throw new websockets_1.WsException('No user data on socket.');
            }
            const message = {
                id: `msg-live-${Date.now()}-${Math.random()}`,
                text: payload.message.text,
                imageUrl: payload.message.imageUrl,
                sender: {
                    id: user.sub,
                    username: user.username,
                    avatarUrl: user.avatarUrl,
                },
                chat: { id: payload.streamId },
                timestamp: Date.now(),
            };
            this.server.to(payload.streamId).emit('newMessage', message);
        }
        catch (error) {
            this.logger.error(`Error handling stream message: ${error.message}`);
            client.emit('error', new websockets_1.WsException('Failed to send stream message.'));
        }
    }
    handleTyping(client, payload) {
        const userId = this.getSocketUserId(client);
        client.to(payload.chatId).emit('typing', { userId, isTyping: payload.isTyping });
    }
    handleDeleteMessage(client, payload) {
        const user = client.data.user;
        if (user.role !== user_entity_1.UserRole.SUPER_ADMIN && user.role !== user_entity_1.UserRole.MODERATOR) {
            this.logger.warn(`User ${user.sub} attempted to delete a message without permission.`);
            return;
        }
        this.logger.log(`Moderator ${user.sub} deleting message ${payload.messageId} from room ${payload.roomId}`);
        this.server.to(payload.roomId).emit('messageDeleted', { messageId: payload.messageId });
    }
    handleJoinStreamRoom(client, streamId) {
        client.join(streamId);
        client.data.streamId = streamId;
        this.logger.log(`Client ${client.id} (user: ${client.data.user?.sub}) joined stream room: ${streamId}`);
        this.broadcastStreamStats(streamId);
    }
    handleLeaveStreamRoom(client, streamId) {
        client.leave(streamId);
        delete client.data.streamId;
        this.logger.log(`Client ${client.id} left stream room: ${streamId}`);
        this.broadcastStreamStats(streamId);
    }
    async handleLikeStream(client, streamId) {
        try {
            await this.livestreamRepository.increment({ id: streamId }, 'likes', 1);
            const stream = await this.livestreamRepository.findOneBy({ id: streamId });
            if (stream) {
                const room = this.server.sockets.adapter.rooms.get(streamId);
                const viewerCount = room ? room.size : 0;
                this.server.to(streamId).emit('streamUpdate', { viewers: viewerCount, likes: stream.likes });
            }
        }
        catch (error) {
            this.logger.error(`Error handling like for stream ${streamId}: ${error.message}`);
        }
    }
    handleStreamEnded(client, payload) {
        const user = client.data.user;
        if (user.role !== user_entity_1.UserRole.SUPER_ADMIN && user.role !== user_entity_1.UserRole.MODERATOR) {
            this.logger.warn(`User ${user.sub} attempted to broadcast stream end without permission.`);
            return;
        }
        this.logger.log(`Moderator ${user.sub} ending stream for room ${payload.roomId}`);
        this.server.to(payload.roomId).emit('streamEnded');
    }
    getSocketUserId(client) {
        const user = client.data.user;
        if (!user?.sub) {
            throw new websockets_1.WsException('Authentication required');
        }
        return user.sub;
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinChat'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveChat'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('markAsRead'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleMarkAsRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendStreamMessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleStreamMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('deleteMessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleDeleteMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinStreamRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleJoinStreamRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveStreamRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleLeaveStreamRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('likeStream'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleLikeStream", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('streamEndedBroadcast'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleStreamEnded", null);
exports.EventsGateway = EventsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __param(2, (0, typeorm_1.InjectRepository)(livestream_entity_1.Livestream)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        chats_service_1.ChatsService,
        typeorm_2.Repository,
        livestreams_service_1.LivestreamsService])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map