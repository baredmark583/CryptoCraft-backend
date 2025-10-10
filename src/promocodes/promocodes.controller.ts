import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PromoCodesService } from './promocodes.service';
import { CreatePromoCodeDto } from './dto/create-promocode.dto';
import { ValidatePromoCodeDto } from './dto/validate-promocode.dto';

@Controller('promocodes')
@UseGuards(JwtAuthGuard)
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Post()
  create(@Req() req, @Body() createDto: CreatePromoCodeDto) {
    return this.promoCodesService.create(req.user.userId, createDto);
  }
  
  @Get('seller/:sellerId')
  findBySeller(@Param('sellerId', ParseUUIDPipe) sellerId: string) {
    return this.promoCodesService.findBySellerId(sellerId);
  }

  @Post('validate')
  validate(@Body() validateDto: ValidatePromoCodeDto) {
    return this.promoCodesService.validate(validateDto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.promoCodesService.remove(id, req.user.userId);
  }
}