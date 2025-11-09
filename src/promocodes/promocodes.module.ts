import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCodesService } from './promocodes.service';
import { PromoCodesController } from './promocodes.controller';
import { PromoCode } from './entities/promocode.entity';
import { GlobalPromoCode } from './entities/global-promocode.entity';
import { GlobalPromoCodesService } from './global-promocodes.service';
import { GlobalPromoCodesController } from './global-promocodes.controller';
import { User } from '../users/entities/user.entity';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PromoCode, GlobalPromoCode, User]),
    forwardRef(() => ProductsModule),
  ],
  controllers: [PromoCodesController, GlobalPromoCodesController],
  providers: [PromoCodesService, GlobalPromoCodesService],
  exports: [PromoCodesService, GlobalPromoCodesService],
})
export class PromoCodesModule {}
