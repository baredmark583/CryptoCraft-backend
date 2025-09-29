import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { AiModule } from './ai/ai.module';
import { UploadModule } from './upload/upload.module';
import { CategoriesModule } from './categories/categories.module';
import { IconsModule } from './icons/icons.module';
import { SettingsModule } from './settings/settings.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DisputesModule } from './disputes/disputes.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TelegramModule } from './telegram/telegram.module';
import { ScrapingModule } from './scraping/scraping.module';
import { ImportModule } from './import/import.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the ConfigService available throughout the app
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true, // In production, consider using migrations instead
        ssl: {
          rejectUnauthorized: false,
        }
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    AiModule,
    UploadModule,
    CategoriesModule,
    IconsModule,
    SettingsModule,
    DashboardModule,
    DisputesModule,
    TransactionsModule,
    TelegramModule,
    ScrapingModule,
    ImportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}