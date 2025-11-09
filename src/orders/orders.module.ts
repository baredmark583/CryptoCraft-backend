import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { TelegramModule } from '../telegram/telegram.module';
import { EscrowModule } from '../escrow/escrow.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, User, Product]),
    TelegramModule,
    forwardRef(() => EscrowModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
