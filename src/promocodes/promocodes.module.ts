import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromoCodesService } from './promocodes.service';
import { PromoCodesController } from './promocodes.controller';
import { PromoCode } from './entities/promocode.entity';
import { User } from '../users/entities/user.entity';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PromoCode, User]),
    forwardRef(() => ProductsModule),
  ],
  controllers: [PromoCodesController],
  providers: [PromoCodesService],
  exports: [PromoCodesService],
})
export class PromoCodesModule {}