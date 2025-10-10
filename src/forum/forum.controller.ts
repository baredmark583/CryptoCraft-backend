import { Controller, Get, Post, Body, Param, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ForumService } from './forum.service';
import { CreateForumThreadDto } from './dto/create-forum-thread.dto';
import { CreateForumPostDto } from './dto/create-forum-post.dto';

@Controller('forum')
@UseGuards(JwtAuthGuard)
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Post('threads')
  createThread(@Req() req, @Body() createDto: CreateForumThreadDto) {
    return this.forumService.createThread(req.user.userId, createDto);
  }

  @Get('threads')
  getAllThreads() {
    return this.forumService.findAllThreads();
  }

  @Get('threads/:id')
  getThreadById(@Param('id', ParseUUIDPipe) id: string) {
    return this.forumService.findThreadById(id);
  }

  @Get('threads/:id/posts')
  getPostsByThreadId(@Param('id', ParseUUIDPipe) id: string) {
    return this.forumService.findPostsByThreadId(id);
  }

  @Post('threads/:id/posts')
  createPost(
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createDto: CreateForumPostDto,
  ) {
    return this.forumService.createPost(req.user.userId, id, createDto);
  }
}