"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const products_module_1 = require("./products/products.module");
const orders_module_1 = require("./orders/orders.module");
const chats_module_1 = require("./chats/chats.module");
const ai_module_1 = require("./ai/ai.module");
const upload_module_1 = require("./upload/upload.module");
const categories_module_1 = require("./categories/categories.module");
const reviews_module_1 = require("./reviews/reviews.module");
const workshop_module_1 = require("./workshop/workshop.module");
const collections_module_1 = require("./collections/collections.module");
const notifications_module_1 = require("./notifications/notifications.module");
const forum_module_1 = require("./forum/forum.module");
const livestreams_module_1 = require("./livestreams/livestreams.module");
const governance_module_1 = require("./governance/governance.module");
const disputes_module_1 = require("./disputes/disputes.module");
const transactions_module_1 = require("./transactions/transactions.module");
const settings_module_1 = require("./settings/settings.module");
const import_module_1 = require("./import/import.module");
const scraping_module_1 = require("./scraping/scraping.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const events_module_1 = require("./events/events.module");
const promocodes_module_1 = require("./promocodes/promocodes.module");
const icons_module_1 = require("./icons/icons.module");
const nova_poshta_module_1 = require("./nova-poshta/nova-poshta.module");
const escrow_module_1 = require("./escrow/escrow.module");
const monitoring_module_1 = require("./monitoring/monitoring.module");
const request_logger_interceptor_1 = require("./common/interceptors/request-logger.interceptor");
const metrics_interceptor_1 = require("./common/interceptors/metrics.interceptor");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot({
                throttlers: [{ ttl: 60, limit: 100 }],
            }),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            nestjs_pino_1.LoggerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const isProd = configService.get('NODE_ENV') === 'production';
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
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const databaseUrl = configService.get('DATABASE_URL');
                    if (!databaseUrl) {
                        throw new Error('DATABASE_URL is not configured');
                    }
                    const isProd = configService.get('NODE_ENV') === 'production';
                    return {
                        type: 'postgres',
                        url: databaseUrl,
                        autoLoadEntities: true,
                        synchronize: !isProd,
                        ssl: isProd ? { rejectUnauthorized: true } : false,
                    };
                },
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            orders_module_1.OrdersModule,
            chats_module_1.ChatsModule,
            ai_module_1.AiModule,
            upload_module_1.UploadModule,
            categories_module_1.CategoriesModule,
            reviews_module_1.ReviewsModule,
            workshop_module_1.WorkshopModule,
            collections_module_1.CollectionsModule,
            notifications_module_1.NotificationsModule,
            forum_module_1.ForumModule,
            livestreams_module_1.LivestreamsModule,
            governance_module_1.GovernanceModule,
            disputes_module_1.DisputesModule,
            transactions_module_1.TransactionsModule,
            settings_module_1.SettingsModule,
            import_module_1.ImportModule,
            scraping_module_1.ScrapingModule,
            dashboard_module_1.DashboardModule,
            events_module_1.EventsModule,
            promocodes_module_1.PromoCodesModule,
            icons_module_1.IconsModule,
            nova_poshta_module_1.NovaPoshtaModule,
            escrow_module_1.EscrowModule,
            monitoring_module_1.MonitoringModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_INTERCEPTOR, useClass: metrics_interceptor_1.MetricsInterceptor },
            { provide: core_1.APP_INTERCEPTOR, useClass: request_logger_interceptor_1.RequestLoggerInterceptor },
            { provide: core_1.APP_FILTER, useClass: all_exceptions_filter_1.AllExceptionsFilter },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map