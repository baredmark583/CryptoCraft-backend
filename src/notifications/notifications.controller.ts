import { Controller, Get, Post, Body, UseGuards, Req, Param, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { ProductsService } from 'src/products/products.service';
import { PromoCodesService } from 'src/promocodes/promocodes.service';
import { PersonalOfferDto } from './dto/personal-offer.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
      private readonly notificationsService: NotificationsService,
      private readonly productsService: ProductsService,
      private readonly promoCodesService: PromoCodesService,
    ) {}

  @Get()
  getNotifications(@Req() req) {
    return this.notificationsService.findByUserId(req.user.userId);
  }

  @Post('read')
  markAllAsRead(@Req() req) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }
  
  @Post('personal-offer')
  async sendPersonalOffer(@Req() req, @Body() offerDto: PersonalOfferDto) {
    const product = await this.productsService.findOne(offerDto.productId);
    const promoCode = await this.promoCodesService.findOne(offerDto.promoId, req.user.userId);
    return this.notificationsService.createPersonalOffer(req.user.userId, offerDto.recipientId, product, promoCode);
  }
}