import { Controller, Post, Body, Get, Param, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkshopService } from './workshop.service';
import { CreateWorkshopPostDto } from './dto/create-workshop-post.dto';
import { CreateWorkshopCommentDto } from './dto/create-workshop-comment.dto';

@Controller('workshop')
@UseGuards(JwtAuthGuard)
export class WorkshopController {
  constructor(private readonly workshopService: WorkshopService) {}

  @Post('posts')
  createPost(@Req() req, @Body() createPostDto: CreateWorkshopPostDto) {
    return this.workshopService.createPost(req.user.userId, createPostDto);
  }

  @Get('posts/user/:sellerId')
  getPostsBySeller(@Param('sellerId', ParseUUIDPipe) sellerId: string) {
    return this.workshopService.getPostsBySellerId(sellerId);
  }

  @Get('feed')
  getFeed(@Req() req) {
    return this.workshopService.getFeedForUser(req.user.userId);
  }

  @Post('posts/:postId/like')
  likePost(@Req() req, @Param('postId', ParseUUIDPipe) postId: string) {
    return this.workshopService.likePost(postId, req.user.userId);
  }

  @Post('posts/:postId/comments')
  addComment(
    @Req() req,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() createCommentDto: CreateWorkshopCommentDto,
  ) {
    return this.workshopService.addComment(postId, req.user.userId, createCommentDto);
  }
}