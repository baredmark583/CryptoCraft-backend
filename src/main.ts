import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Logger } from 'nestjs-pino';
import { traceIdMiddleware } from './common/middleware/trace-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const logger = app.get(Logger);
  app.useLogger(logger);

  app.useWebSocketAdapter(new IoAdapter(app));
  app.use(traceIdMiddleware);

  const configService: ConfigService = app.get(ConfigService);
  // Strict ENV validation (fail-fast)
  const requiredEnv = [
    'DATABASE_URL',
    'JWT_SECRET',
    'TELEGRAM_BOT_TOKEN',
    'CLOUDINARY_URL',
    'LIVEKIT_API_KEY',
    'LIVEKIT_API_SECRET',
  ];
  const missing = requiredEnv.filter((k) => !configService.get<string>(k));
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const adminUrl = configService.get<string>('ADMIN_URL');
  const extraCors = configService.get<string>('EXTRA_CORS'); // optional, comma-separated
  const nodeEnv = configService.get<string>('NODE_ENV');

  // Build whitelist from ENV only. In non-production, allow localhost defaults for convenience.
  const whitelist: string[] = [];
  if (frontendUrl) whitelist.push(frontendUrl);
  if (adminUrl) whitelist.push(adminUrl);
  if (extraCors) {
    extraCors.split(',').map(v => v.trim()).filter(Boolean).forEach(v => {
      if (!whitelist.includes(v)) whitelist.push(v);
    });
  }
  if (nodeEnv !== 'production') {
    ['http://localhost:3000', 'http://localhost:5173'].forEach(v => {
      if (!whitelist.includes(v)) whitelist.push(v);
    });
  }

  app.enableCors({
    origin: whitelist.length > 0 ? whitelist : undefined,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Accept',
    credentials: true,
  });

  // Security headers
  const isProd = (configService.get<string>('NODE_ENV') === 'production');
  if (isProd) {
    app.use(helmet({
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
  } else {
    app.use(helmet());
  }


  // Increase payload limits
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically remove non-whitelisted properties
    transform: true, // Automatically transform payloads to DTO instances
  }));

  // Simple CSRF protection: require x-csrf-token header to match csrf_token cookie on state-changing requests
  app.use((req, res, next) => {
    const method = req.method.toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return next();
    const cookieHeader = req.headers.cookie || '';
    const cookies = cookieHeader.split(';').map(v => v.trim()).map(v => v.split('=')).reduce((acc, [k, ...rest]) => ({ ...acc, [k]: decodeURIComponent(rest.join('=')) }), {} as Record<string, string>);
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
