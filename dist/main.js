"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const express_1 = require("express");
const helmet_1 = require("helmet");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const nestjs_pino_1 = require("nestjs-pino");
const trace_id_middleware_1 = require("./common/middleware/trace-id.middleware");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const logger = app.get(nestjs_pino_1.Logger);
    app.useLogger(logger);
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
    app.use(trace_id_middleware_1.traceIdMiddleware);
    const configService = app.get(config_1.ConfigService);
    const requiredEnv = [
        'DATABASE_URL',
        'JWT_SECRET',
        'TELEGRAM_BOT_TOKEN',
        'CLOUDINARY_URL',
        'LIVEKIT_API_KEY',
        'LIVEKIT_API_SECRET',
    ];
    const missing = requiredEnv.filter((k) => !configService.get(k));
    if (missing.length > 0) {
        console.error(`Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }
    const frontendUrl = configService.get('FRONTEND_URL');
    const adminUrl = configService.get('ADMIN_URL');
    const extraCors = configService.get('EXTRA_CORS');
    const nodeEnv = configService.get('NODE_ENV');
    const whitelist = [];
    if (frontendUrl)
        whitelist.push(frontendUrl);
    if (adminUrl)
        whitelist.push(adminUrl);
    if (extraCors) {
        extraCors.split(',').map(v => v.trim()).filter(Boolean).forEach(v => {
            if (!whitelist.includes(v))
                whitelist.push(v);
        });
    }
    if (nodeEnv !== 'production') {
        ['http://localhost:3000', 'http://localhost:5173'].forEach(v => {
            if (!whitelist.includes(v))
                whitelist.push(v);
        });
    }
    app.enableCors({
        origin: whitelist.length > 0 ? whitelist : undefined,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Authorization, Accept',
        credentials: true,
    });
    const isProd = (configService.get('NODE_ENV') === 'production');
    if (isProd) {
        app.use((0, helmet_1.default)({
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'data:'],
                    imgSrc: ["'self'", 'data:', 'https:'],
                    connectSrc: ["'self'", 'https:', 'wss:'],
                    mediaSrc: ["'self'", 'https:'],
                    frameSrc: ["'self'", 'https:'],
                    objectSrc: ["'none'"],
                },
            },
            crossOriginEmbedderPolicy: false,
        }));
    }
    else {
        app.use((0, helmet_1.default)());
    }
    app.use((0, express_1.json)({ limit: '10mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '10mb' }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    app.use((req, res, next) => {
        const method = req.method.toUpperCase();
        if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS')
            return next();
        const cookieHeader = req.headers.cookie || '';
        const cookies = cookieHeader.split(';').map(v => v.trim()).map(v => v.split('=')).reduce((acc, [k, ...rest]) => ({ ...acc, [k]: decodeURIComponent(rest.join('=')) }), {});
        if (cookies['access_token']) {
            const csrfHeader = req.headers['x-csrf-token'];
            if (!csrfHeader || csrfHeader !== cookies['csrf_token']) {
                res.status(403).json({ message: 'Invalid CSRF token' });
                return;
            }
        }
        next();
    });
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
//# sourceMappingURL=main.js.map