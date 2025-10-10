import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { PromoCode } from '../promocodes/entities/promocode.entity';
import { ProductsModule } from 'src/products/products.module';
import { PromoCodesModule } from 'src/promocodes/promocodes.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([Notification, User, Product, PromoCode]),
      forwardRef(() => ProductsModule),
      forwardRef(() => PromoCodesModule),
    ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

