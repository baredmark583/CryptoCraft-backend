import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { TelegramUser } from './strategies/telegram.strategy';
import { User, UserRole } from 'src/users/entities/user.entity';
import { AdminLoginDto } from './dto/admin-login.dto';

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

  async validateAdmin(adminLoginDto: AdminLoginDto): Promise<Partial<User>> {
    const adminEmail = this.configService.get<string>('SUPER_ADMIN_EMAIL') || 'admin';
    const adminPass = this.configService.get<string>('SUPER_ADMIN_PASSWORD') || 'admin';

    if (adminLoginDto.email === adminEmail && adminLoginDto.password === adminPass) {
      // For admin, we create a user-like object for the JWT payload
      return { id: 'admin-user', name: 'Administrator', role: UserRole.SUPER_ADMIN };
    }
    throw new UnauthorizedException('Invalid admin credentials');
  }

  async login(user: Partial<User>) {
    const payload = { sub: user.id, username: user.name, role: user.role || UserRole.USER };
    return {
      access_token: this.jwtService.sign(payload),
      user: user, // Возвращаем данные пользователя на фронтенд
    };
  }
}
