import { Controller, Get, Post, Body, Param, UseGuards, Req, ParseUUIDPipe, Query, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ForumService } from './forum.service';
import { CreateForumThreadDto } from './dto/create-forum-thread.dto';
import { CreateForumPostDto } from './dto/create-forum-post.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { PinThreadDto } from './dto/pin-thread.dto';
import { UpdateThreadModerationDto } from './dto/update-thread-moderation.dto';
import { ReportForumPostDto } from './dto/report-forum-post.dto';

@Controller('forum')
@UseGuards(JwtAuthGuard)
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post('threads')
  createThread(@Req() req, @Body() createDto: CreateForumThreadDto) {
    return this.forumService.createThread(req.user.userId, createDto);
  }

  @Get('threads')
  getAllThreads(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('pinnedOnly') pinnedOnly?: string,
  ) {
    return this.forumService.findAllThreads({
      page: Number(page),
      limit: Number(limit),
      search,
      tag,
      pinnedOnly: pinnedOnly === 'true',
    });
  }

  @Get('threads/:id')
  getThreadById(@Param('id', ParseUUIDPipe) id: string) {
    return this.forumService.findThreadById(id);
  }

  @Get('threads/:id/posts')
  getPostsByThreadId(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page = '1',
    @Query('limit') limit = '25',
  ) {
    return this.forumService.findPostsByThreadId(id, Number(page), Number(limit));
  }

  @Post('threads/:id/posts')
  createPost(
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createDto: CreateForumPostDto,
  ) {
    return this.forumService.createPost(req.user.userId, id, createDto);
  }

  @Patch('threads/:id/pin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.SUPER_ADMIN)
  pinThread(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PinThreadDto) {
    return this.forumService.pinThread(id, dto);
  }

  @Patch('threads/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.SUPER_ADMIN)
  updateThreadStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateThreadModerationDto) {
    return this.forumService.updateThreadStatus(id, dto);
  }

  @Post('posts/:postId/report')
  reportPost(
    @Req() req,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: ReportForumPostDto,
  ) {
    return this.forumService.reportPost(postId, req.user.userId, dto);
  }
}
