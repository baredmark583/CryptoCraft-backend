import { Controller, Post, Body, Get, Param, UseGuards, Req, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkshopService } from './workshop.service';
import { CreateWorkshopPostDto } from './dto/create-workshop-post.dto';
import { CreateWorkshopCommentDto } from './dto/create-workshop-comment.dto';
import { ReportWorkshopContentDto } from './dto/report-workshop-content.dto';
import { ModerateWorkshopContentDto } from './dto/moderate-workshop-content.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

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

  @Post('posts/:postId/report')
  reportPost(
    @Req() req,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: ReportWorkshopContentDto,
  ) {
    return this.workshopService.reportPost(postId, req.user.userId, dto);
  }

  @Post('comments/:commentId/report')
  reportComment(
    @Req() req,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: ReportWorkshopContentDto,
  ) {
    return this.workshopService.reportComment(commentId, req.user.userId, dto);
  }

  @Get('moderation/posts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.SUPER_ADMIN)
  listFlaggedPosts(@Query('limit') limit = '20', @Query('offset') offset = '0') {
    return this.workshopService.listFlaggedPosts(Number(limit), Number(offset));
  }

  @Get('moderation/comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.SUPER_ADMIN)
  listFlaggedComments(@Query('limit') limit = '20', @Query('offset') offset = '0') {
    return this.workshopService.listFlaggedComments(Number(limit), Number(offset));
  }

  @Patch('posts/:postId/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.SUPER_ADMIN)
  moderatePost(
    @Req() req,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: ModerateWorkshopContentDto,
  ) {
    return this.workshopService.moderatePost(postId, dto, req.user.userId);
  }

  @Patch('comments/:commentId/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.SUPER_ADMIN)
  moderateComment(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: ModerateWorkshopContentDto,
  ) {
    return this.workshopService.moderateComment(commentId, dto);
  }
}
