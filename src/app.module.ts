
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ChatsModule } from './chats/chats.module';
import { AiModule } from './ai/ai.module';
import { UploadModule } from './upload/upload.module';
import { CategoriesModule } from './categories/categories.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WorkshopModule } from './workshop/workshop.module';
import { CollectionsModule } from './collections/collections.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ForumModule } from './forum/forum.module';
import { LivestreamsModule } from './livestreams/livestreams.module';
import { GovernanceModule } from './governance/governance.module';
import { DisputesModule } from './disputes/disputes.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SettingsModule } from './settings/settings.module';
import { ImportModule } from './import/import.module';
import { ScrapingModule } from './scraping/scraping.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EventsModule } from './events/events.module';
import { PromoCodesModule } from './promocodes/promocodes.module';
import { IconsModule } from './icons/icons.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        // FIX: Replaced explicit entity path with `autoLoadEntities: true` to resolve `__dirname` error and simplify entity loading.
        autoLoadEntities: true,
        synchronize: true, // Be careful with this in production
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    ChatsModule,
    AiModule,
    UploadModule,
    CategoriesModule,
    ReviewsModule,
    WorkshopModule,
    CollectionsModule,
    NotificationsModule,
    ForumModule,
    LivestreamsModule,
    GovernanceModule,
    DisputesModule,
    TransactionsModule,
    SettingsModule,
    ImportModule,
    ScrapingModule,
    DashboardModule,
    EventsModule,
    PromoCodesModule,
    IconsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
