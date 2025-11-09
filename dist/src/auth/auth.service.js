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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const crypto = require("crypto");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../users/entities/user.entity");
let AuthService = class AuthService {
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.failedAdminAttempts = new Map();
        this.maxAdminAttempts = 5;
        this.lockoutMs = 15 * 60 * 1000;
        this.botToken = this.configService.get('TELEGRAM_BOT_TOKEN');
        if (!this.botToken) {
            throw new common_1.InternalServerErrorException('TELEGRAM_BOT_TOKEN is not configured in environment variables. Server cannot validate Telegram users.');
        }
    }
    async validateTelegramData(initData) {
        const data = new URLSearchParams(initData);
        const hash = data.get('hash');
        const user = JSON.parse(data.get('user'));
        if (!hash || !user) {
            throw new common_1.UnauthorizedException('Invalid Telegram data: hash or user is missing');
        }
        const dataToCheck = [];
        data.sort();
        data.forEach((val, key) => key !== 'hash' && dataToCheck.push(`${key}=${val}`));
        const secret = crypto
            .createHmac('sha256', 'WebAppData')
            .update(this.botToken)
            .digest();
        const hmac = crypto
            .createHmac('sha256', secret)
            .update(dataToCheck.join('\n'))
            .digest('hex');
        if (hmac !== hash) {
            throw new common_1.UnauthorizedException('Invalid Telegram data: hash mismatch');
        }
        return this.usersService.findByTelegramIdOrCreate(user);
    }
    async validateTelegramWebLogin(dto) {
        const { hash, ...userData } = dto;
        const dataToCheck = Object.keys(userData)
            .sort()
            .map(key => (`${key}=${userData[key]}`))
            .join('\n');
        const secretKey = crypto.createHash('sha256').update(this.botToken).digest();
        const hmac = crypto.createHmac('sha256', secretKey).update(dataToCheck).digest('hex');
        if (hmac !== hash) {
            throw new common_1.UnauthorizedException('Invalid Telegram data: web login hash mismatch');
        }
        const authDate = new Date(dto.auth_date * 1000);
        if (Date.now() - authDate.getTime() > 86400000) {
            throw new common_1.UnauthorizedException('Telegram data is outdated.');
        }
        const telegramUser = {
            id: dto.id,
            first_name: dto.first_name,
            last_name: dto.last_name,
            username: dto.username,
            photo_url: dto.photo_url,
        };
        return this.usersService.findByTelegramIdOrCreate(telegramUser);
    }
    async validateAdmin(adminLoginDto) {
        const key = adminLoginDto.email.trim().toLowerCase();
        const entry = this.failedAdminAttempts.get(key) || { count: 0 };
        const now = Date.now();
        if (entry.lockedUntil && now < entry.lockedUntil) {
            throw new common_1.UnauthorizedException('Account temporarily locked due to multiple failed attempts. Try again later.');
        }
        const adminEmail = (this.configService.get('SUPER_ADMIN_EMAIL') || 'admin').trim();
        const adminPass = (this.configService.get('SUPER_ADMIN_PASSWORD') || 'admin').trim();
        if (adminLoginDto.email.trim() === adminEmail && adminLoginDto.password.trim() === adminPass) {
            this.failedAdminAttempts.delete(key);
            return { id: 'admin-user', email: adminEmail, name: 'Administrator', role: user_entity_1.UserRole.SUPER_ADMIN };
        }
        entry.count += 1;
        if (entry.count >= this.maxAdminAttempts) {
            entry.lockedUntil = now + this.lockoutMs;
        }
        this.failedAdminAttempts.set(key, entry);
        await new Promise(r => setTimeout(r, 200));
        throw new common_1.UnauthorizedException('Invalid admin credentials');
    }
    async login(user) {
        const payload = {
            sub: user.id,
            username: user.name,
            role: user.role || user_entity_1.UserRole.USER,
            avatarUrl: user.avatarUrl,
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: user,
        };
    }
    async getMe(userId, userRole) {
        if (userId === 'admin-user' &&
            (userRole === user_entity_1.UserRole.SUPER_ADMIN || userRole === user_entity_1.UserRole.MODERATOR)) {
            return {
                id: 'admin-user',
                email: this.configService.get('SUPER_ADMIN_EMAIL'),
                name: 'Administrator',
                role: userRole,
            };
        }
        try {
            const user = await this.usersService.findOne(userId);
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw new common_1.UnauthorizedException('User from token could not be found.');
            }
            throw error;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map