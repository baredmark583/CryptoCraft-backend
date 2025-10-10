import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { User } from '../users/entities/user.entity';
import { PromoCodesModule } from 'src/promocodes/promocodes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, User]),
    forwardRef(() => PromoCodesModule),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}