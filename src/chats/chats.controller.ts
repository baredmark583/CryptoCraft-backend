import { Controller, Get, Post, Body, Param, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  getChatsForUser(@Req() req) {
    return this.chatsService.getChats(req.user.userId);
  }

  @Post()
  findOrCreateChat(@Req() req, @Body() createChatDto: CreateChatDto) {
    return this.chatsService.findOrCreateChat(req.user.userId, createChatDto.recipientId);
  }

  @Get(':id')
  getChatMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ) {
    return this.chatsService.getChatWithMessages(id, req.user.userId);
  }

  @Post(':id/messages')
  createMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.chatsService.createMessage(id, req.user.userId, createMessageDto);
  }
}
