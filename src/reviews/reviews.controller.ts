import { Controller, Get, Post, Body, Param, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.userId, createReviewDto);
  }

  @Get('product/:productId')
  getReviewsForProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.reviewsService.findByProductId(productId);
  }

  @Get('user/:userId')
  getReviewsByAuthor(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.reviewsService.findByAuthorId(userId);
  }
}