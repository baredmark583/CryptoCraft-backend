import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Dispute } from '../disputes/entities/dispute.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, Product, Dispute])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}