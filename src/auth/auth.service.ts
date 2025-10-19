import { Injectable, UnauthorizedException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { TelegramUser } from './strategies/telegram.strategy';
import { User, UserRole } from 'src/users/entities/user.entity';
import { AdminLoginDto } from './dto/admin-login.dto';
import { WebLoginDto } from './dto/web-login.dto';

@Injectable()
export class AuthService {
  private readonly botToken: string;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!this.botToken) {
      throw new InternalServerErrorException('TELEGRAM_BOT_TOKEN is not configured in environment variables. Server cannot validate Telegram users.');
    }
  }

  async validateTelegramData(initData: string): Promise<User> {
    const data = new URLSearchParams(initData);
    const hash = data.get('hash');
    const user = JSON.parse(data.get('user'));

    if (!hash || !user) {
      throw new UnauthorizedException('Invalid Telegram data: hash or user is missing');
    }

    const dataToCheck: string[] = [];
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
      throw new UnauthorizedException('Invalid Telegram data: hash mismatch');
    }

    // Данные достоверны, ищем или создаем пользователя
    return this.usersService.findByTelegramIdOrCreate(user);
  }

  async validateTelegramWebLogin(dto: WebLoginDto): Promise<User> {
    const { hash, ...userData } = dto;

    const dataToCheck = Object.keys(userData)
      .sort()
      .map(key => (`${key}=${(userData as any)[key]}`))
      .join('\n');

    const secretKey = crypto.createHash('sha256').update(this.botToken).digest();
    const hmac = crypto.createHmac('sha256', secretKey).update(dataToCheck).digest('hex');

    if (hmac !== hash) {
      throw new UnauthorizedException('Invalid Telegram data: web login hash mismatch');
    }
    
    // Check if data is recent (e.g., within 24 hours)
    const authDate = new Date(dto.auth_date * 1000);
    if (Date.now() - authDate.getTime() > 86400000) {
        throw new UnauthorizedException('Telegram data is outdated.');
    }

    // Data is valid, find or create user
    const telegramUser: TelegramUser = {
        id: dto.id,
        first_name: dto.first_name,
        last_name: dto.last_name,
        username: dto.username,
        photo_url: dto.photo_url,
    };

    return this.usersService.findByTelegramIdOrCreate(telegramUser);
  }

  async validateAdmin(adminLoginDto: AdminLoginDto): Promise<Partial<User>> {
    const adminEmail = (this.configService.get<string>('SUPER_ADMIN_EMAIL') || 'admin').trim();
    const adminPass = (this.configService.get<string>('SUPER_ADMIN_PASSWORD') || 'admin').trim();

    if (adminLoginDto.email.trim() === adminEmail && adminLoginDto.password.trim() === adminPass) {
      // For admin, we create a user-like object for the JWT payload
      return { id: 'admin-user', email: adminEmail, name: 'Administrator', role: UserRole.SUPER_ADMIN };
    }
    throw new UnauthorizedException('Invalid admin credentials');
  }

  async login(user: Partial<User>) {
    const payload = {
      sub: user.id,
      username: user.name,
      role: user.role || UserRole.USER,
      avatarUrl: (user as User).avatarUrl,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: user, // Возвращаем данные пользователя на фронтенд
    };
  }

  async getMe(userId: string, userRole: UserRole): Promise<User | Partial<User>> {
    // Handle special admin user case. This user does not exist in the database.
    if (
      userId === 'admin-user' &&
      (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.MODERATOR)
    ) {
      return {
        id: 'admin-user',
        email: this.configService.get<string>('SUPER_ADMIN_EMAIL'),
        name: 'Administrator',
        role: userRole,
      };
    }

    try {
        const user = await this.usersService.findOne(userId);
        return user;
    } catch (error) {
        if (error instanceof NotFoundException) {
            throw new UnauthorizedException('User from token could not be found.');
        }
        // Re-throw other errors
        throw error;
    }
  }
}