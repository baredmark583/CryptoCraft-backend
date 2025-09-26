import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // FIX: Explicitly type configService to resolve Untyped function call error.
  const configService: ConfigService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const adminUrl = configService.get<string>('ADMIN_URL');

  // Whitelist of allowed origins for CORS.
  // Includes known deployment URLs and local development URLs from environment variables.
  const whitelist = new Set([
    'https://cryptocraft-frontend.onrender.com', // Production Frontend
    'https://administrator-wusk.onrender.com', // Production Admin
  ]);

  // Add URLs from environment variables if they exist
  if (frontendUrl) whitelist.add(frontendUrl);
  if (adminUrl) whitelist.add(adminUrl);


  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      // and requests from whitelisted origins.
      if (!origin || whitelist.has(origin)) {
        callback(null, true);
      } else {
        // For debugging, log the rejected origin
        console.warn(`CORS: Rejected origin: ${origin}. Allowed origins are: ${[...whitelist].join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });


  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically remove non-whitelisted properties
    transform: true, // Automatically transform payloads to DTO instances
  }));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();