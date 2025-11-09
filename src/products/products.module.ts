import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductModerationEvent } from './entities/product-moderation-event.entity';
import { ProductRevision } from './entities/product-revision.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { User } from '../users/entities/user.entity';
import { PromoCodesModule } from 'src/promocodes/promocodes.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductModerationEvent, ProductRevision, User]),
    forwardRef(() => PromoCodesModule),
    CategoriesModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
