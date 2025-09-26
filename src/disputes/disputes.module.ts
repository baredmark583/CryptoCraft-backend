import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisputesService } from './disputes.service';
import { DisputesController } from './disputes.controller';
import { Dispute } from './entities/dispute.entity';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dispute, Order])],
  controllers: [DisputesController],
  providers: [DisputesService],
})
export class DisputesModule {}