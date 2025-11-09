

import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
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
import { NovaPoshtaModule } from './nova-poshta/nova-poshta.module';
import { EscrowModule } from './escrow/escrow.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { RequestLoggerInterceptor } from './common/interceptors/request-logger.interceptor';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60, limit: 100 }],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProd = configService.get<string>('NODE_ENV') === 'production';
        return {
          pinoHttp: {
            level: isProd ? 'info' : 'debug',
            transport: isProd
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: false,
                    translateTime: 'SYS:standard',
                  },
                },
            autoLogging: false,
            customProps: () => ({ service: 'cryptocraft-backend' }),
          },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        if (!databaseUrl) {
          throw new Error('DATABASE_URL is not configured');
        }
        const isProd = configService.get<string>('NODE_ENV') === 'production';
        return {
          type: 'postgres',
          url: databaseUrl,
          autoLoadEntities: true,
          synchronize: !isProd,
          ssl: isProd ? { rejectUnauthorized: true } : false,
        } as const;
      },
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
    NovaPoshtaModule,
    EscrowModule,
    MonitoringModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
    { provide: APP_INTERCEPTOR, useClass: RequestLoggerInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
