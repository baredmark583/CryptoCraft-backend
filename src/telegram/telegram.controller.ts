import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { BroadcastDto } from './dto/broadcast.dto';

@Controller('telegram')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class TelegramController {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly usersService: UsersService,
  ) {}

  @Post('send-message')
  async sendMessageToUser(@Body() sendMessageDto: SendMessageDto) {
    const user = await this.usersService.findOne(sendMessageDto.userId);
    if (user && user.telegramId) {
      await this.telegramService.sendMessage(user.telegramId, sendMessageDto.message);
      return { success: true, message: `Message sent to ${user.name}.` };
    }
    return { success: false, message: 'User not found or has no Telegram ID.' };
  }

  @Post('broadcast')
  async broadcastMessage(@Body() broadcastDto: BroadcastDto) {
    const users = await this.usersService.findAll();
    const telegramUsers = users.filter(u => u.telegramId);

    // Отправляем сообщения асинхронно, не дожидаясь завершения всех
    telegramUsers.forEach(user => {
      this.telegramService.sendMessage(user.telegramId, broadcastDto.message);
    });

    return { success: true, message: `Broadcast started to ${telegramUsers.length} users.` };
  }
}