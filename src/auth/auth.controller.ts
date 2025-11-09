import { Controller, Post, Body, UseGuards, Req, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { WebLoginDto } from './dto/web-login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRole } from 'src/users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 20, ttl: 60 } })
  @Post('telegram')
  async telegramLogin(@Body() telegramAuthDto: TelegramAuthDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateTelegramData(telegramAuthDto.initData);
    const { access_token, user: profile } = await this.authService.login(user);
    const isProd = process.env.NODE_ENV === 'production';
    const csrf = Math.random().toString(36).slice(2);
    res.cookie('access_token', access_token, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/' });
    res.cookie('csrf_token', csrf, { httpOnly: false, secure: isProd, sameSite: 'lax', path: '/' });
    return { user: profile };
  }

  @Throttle({ default: { limit: 20, ttl: 60 } })
  @Post('telegram/web-login')
  async telegramWebLogin(@Body() webLoginDto: WebLoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateTelegramWebLogin(webLoginDto);
    const { access_token, user: profile } = await this.authService.login(user);
    const isProd = process.env.NODE_ENV === 'production';
    const csrf = Math.random().toString(36).slice(2);
    res.cookie('access_token', access_token, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/' });
    res.cookie('csrf_token', csrf, { httpOnly: false, secure: isProd, sameSite: 'lax', path: '/' });
    return { user: profile };
  }

  @Throttle({ default: { limit: 5, ttl: 60 } })
  @Post('admin/login')
  async adminLogin(@Body() adminLoginDto: AdminLoginDto, @Res({ passthrough: true }) res: Response) {
    const adminUser = await this.authService.validateAdmin(adminLoginDto);
    const { access_token, user } = await this.authService.login(adminUser);
    const isProd = process.env.NODE_ENV === 'production';
    const csrf = Math.random().toString(36).slice(2);
    res.cookie('access_token', access_token, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/' });
    res.cookie('csrf_token', csrf, { httpOnly: false, secure: isProd, sameSite: 'lax', path: '/' });
    return { user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    const userId = req.user.userId;
    const userRole = req.user.role as UserRole;
    return this.authService.getMe(userId, userRole);
  }
}
