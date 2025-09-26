import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
