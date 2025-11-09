import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowTransaction } from './entities/escrow-transaction.entity';
import { EscrowEvent } from './entities/escrow-event.entity';
import { EscrowService } from './escrow.service';
import { EscrowController } from './escrow.controller';
import { Order } from '../orders/entities/order.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([EscrowTransaction, EscrowEvent, Order]), ConfigModule],
  controllers: [EscrowController],
  providers: [EscrowService],
  exports: [EscrowService],
})
export class EscrowModule {}
