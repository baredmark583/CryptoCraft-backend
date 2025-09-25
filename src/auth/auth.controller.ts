import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('telegram')
  async telegramLogin(@Body() telegramAuthDto: TelegramAuthDto) {
    const user = await this.authService.validateTelegramData(telegramAuthDto.initData);
    return this.authService.login(user);
  }

  @Post('admin/login')
  async adminLogin(@Body() adminLoginDto: AdminLoginDto) {
    const adminUser = await this.authService.validateAdmin(adminLoginDto);
    return this.authService.login(adminUser);
  }
}
