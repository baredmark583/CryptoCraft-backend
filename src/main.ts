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
  // Using an array for more direct control with the origin function.
  const whitelist = [
    'https://cryptocraft-frontend.onrender.com', // Production Frontend
    'https://administrator-wusk.onrender.com',  // Production Admin
  ];

  // Add URLs from environment variables if they exist
  if (frontendUrl) whitelist.push(frontendUrl);
  if (adminUrl) whitelist.push(adminUrl);


  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      // and requests from whitelisted origins.
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS: Rejected origin: ${origin}. Allowed origins are: ${whitelist.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Explicitly add OPTIONS
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
