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
exports.LivestreamsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const livestream_entity_1 = require("./entities/livestream.entity");
const user_entity_1 = require("../users/entities/user.entity");
const product_entity_1 = require("../products/entities/product.entity");
const config_1 = require("@nestjs/config");
const livekit_server_sdk_1 = require("livekit-server-sdk");
let LivestreamsService = class LivestreamsService {
    constructor(livestreamRepository, userRepository, productRepository, configService) {
        this.livestreamRepository = livestreamRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.configService = configService;
    }
    async create(sellerId, createDto) {
        const seller = await this.userRepository.findOneBy({ id: sellerId });
        if (!seller)
            throw new common_1.NotFoundException('Seller not found');
        const featuredProduct = await this.productRepository.findOneBy({ id: createDto.featuredProductId });
        if (!featuredProduct)
            throw new common_1.NotFoundException('Featured product not found');
        const livestream = this.livestreamRepository.create({
            ...createDto,
            seller,
            featuredProduct,
            status: createDto.scheduledStartTime ? 'UPCOMING' : 'LIVE',
        });
        return this.livestreamRepository.save(livestream);
    }
    findAll() {
        return this.livestreamRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['seller', 'featuredProduct'],
        });
    }
    async findOne(id) {
        const livestream = await this.livestreamRepository.findOne({
            where: { id },
            relations: ['seller', 'featuredProduct'],
        });
        if (!livestream) {
            throw new common_1.NotFoundException(`Livestream with ID "${id}" not found`);
        }
        return livestream;
    }
    async generateJoinToken(streamId, user) {
        const stream = await this.livestreamRepository.findOne({
            where: { id: streamId },
            relations: ['seller'],
        });
        if (!stream) {
            throw new common_1.NotFoundException(`Livestream with ID "${streamId}" not found`);
        }
        const isSeller = user ? stream.seller.id === user.userId : false;
        const identity = user ? user.userId : `guest-${Date.now()}`;
        const name = user ? user.username : `Guest#${Math.floor(Math.random() * 1000)}`;
        const apiKey = this.configService.get('LIVEKIT_API_KEY');
        const apiSecret = this.configService.get('LIVEKIT_API_SECRET');
        const roomName = stream.id;
        if (!apiKey || !apiSecret) {
            throw new Error('LiveKit API key or secret is not configured.');
        }
        const at = new livekit_server_sdk_1.AccessToken(apiKey, apiSecret, {
            identity: identity,
            name: name,
        });
        at.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: isSeller,
            canPublishData: true,
            canSubscribe: true,
        });
        return at.toJwt();
    }
    async endStream(id, userId, userRole) {
        const livestream = await this.findOne(id);
        const isSeller = livestream.seller.id === userId;
        const isModerator = userRole === user_entity_1.UserRole.SUPER_ADMIN || userRole === user_entity_1.UserRole.MODERATOR;
        if (!isSeller && !isModerator) {
            throw new common_1.ForbiddenException('You do not have permission to end this stream.');
        }
        livestream.status = 'ENDED';
        livestream.lastAnalyticsAt = new Date();
        return this.livestreamRepository.save(livestream);
    }
    async recordViewerSnapshot(streamId, viewerCount) {
        const stream = await this.livestreamRepository.findOneBy({ id: streamId });
        if (!stream)
            return;
        const now = new Date();
        if (!stream.lastAnalyticsAt) {
            stream.lastAnalyticsAt = now;
        }
        const minutesElapsed = Math.max(1, Math.floor((now.getTime() - stream.lastAnalyticsAt.getTime()) / 60000));
        stream.viewerCount = viewerCount;
        stream.peakViewers = Math.max(stream.peakViewers, viewerCount);
        stream.totalViewerMinutes += viewerCount * minutesElapsed;
        stream.lastAnalyticsAt = now;
        await this.livestreamRepository.save(stream);
    }
    async flagLivestream(streamId, reporterId, dto) {
        const stream = await this.livestreamRepository.findOneBy({ id: streamId });
        if (!stream)
            throw new common_1.NotFoundException('Livestream not found');
        stream.abuseStrikes += 1;
        stream.abuseReports = [
            ...(stream.abuseReports || []),
            { reason: dto.reason, reporterId: reporterId || 'guest', reportedAt: new Date().toISOString() },
        ];
        if (stream.abuseStrikes >= 5 && stream.status === 'LIVE') {
            stream.status = 'ENDED';
        }
        await this.livestreamRepository.save(stream);
    }
    async attachRecording(streamId, dto, userId) {
        const stream = await this.findOne(streamId);
        if (stream.seller.id !== userId) {
            throw new common_1.ForbiddenException('Only the stream owner can attach recordings');
        }
        stream.recordingUrl = dto.recordingUrl;
        return this.livestreamRepository.save(stream);
    }
    async getAnalytics(streamId, requester) {
        const stream = await this.findOne(streamId);
        const isOwner = stream.seller.id === requester.id;
        const isModerator = requester.role === user_entity_1.UserRole.MODERATOR || requester.role === user_entity_1.UserRole.SUPER_ADMIN;
        if (!isOwner && !isModerator) {
            throw new common_1.ForbiddenException('You do not have permission to view analytics.');
        }
        return stream;
    }
};
exports.LivestreamsService = LivestreamsService;
exports.LivestreamsService = LivestreamsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(livestream_entity_1.Livestream)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], LivestreamsService);
//# sourceMappingURL=livestreams.service.js.map