import { Controller, Post, Body, UseGuards, Req, Get, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    const userId = req.user.userId;
    return this.ordersService.create(createOrderDto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get()
  findAllAdmin() {
    // This is an admin-only route for now.
    // In a real app, you'd have a role-based guard.
    return this.ordersService.findAll();
  }

  @Get('purchases')
  findPurchases(@Req() req) {
    const userId = req.user.userId;
    return this.ordersService.findPurchases(userId);
  }

  @Get('sales')
  findSales(@Req() req) {
    const userId = req.user.userId;
    return this.ordersService.findSales(userId);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }
  
  @Post(':id/generate-waybill')
  generateWaybill(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.generateWaybill(id);
  }
}
