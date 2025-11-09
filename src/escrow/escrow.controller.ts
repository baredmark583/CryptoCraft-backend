import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { FundEscrowDto } from './dto/fund-escrow.dto';
import { ReleaseEscrowDto } from './dto/release-escrow.dto';
import { RefundEscrowDto } from './dto/refund-escrow.dto';
import { TonWebhookDto } from './dto/ton-webhook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @UseGuards(JwtAuthGuard)
  @Get('orders/:orderId')
  getByOrder(@Param('orderId') orderId: string) {
    return this.escrowService.findByOrder(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:orderId/fund')
  markFunded(
    @Param('orderId') orderId: string,
    @Body() dto: FundEscrowDto,
    @Req() req: any,
  ) {
    return this.escrowService.markFunded(orderId, dto, {
      userId: req.user?.id,
      role: req.user?.role || 'USER',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:orderId/release')
  releaseFunds(
    @Param('orderId') orderId: string,
    @Body() dto: ReleaseEscrowDto,
    @Req() req: any,
  ) {
    return this.escrowService.markReleased(orderId, dto, {
      userId: req.user?.id,
      role: req.user?.role || 'ADMIN',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders/:orderId/refund')
  refund(
    @Param('orderId') orderId: string,
    @Body() dto: RefundEscrowDto,
    @Req() req: any,
  ) {
    return this.escrowService.markRefunded(orderId, dto, {
      userId: req.user?.id,
      role: req.user?.role || 'ADMIN',
    });
  }

  @Post('webhooks/ton')
  handleTonWebhook(@Body() dto: TonWebhookDto) {
    return this.escrowService.handleTonWebhook(dto);
  }
}
