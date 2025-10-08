import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  // --- DIAGNOSTIC LOG ---
  // This will print the exact value the application sees for CLOUDINARY_URL.
  // Check your Render logs for this output.
  console.log('--- DIAGNOSTIC LOG ---');
  console.log(`CLOUDINARY_URL from process.env: [${process.env.CLOUDINARY_URL}]`);
  console.log('--- END OF DIAGNOSTIC LOG ---');
  // --- END OF DIAGNOSTIC LOG ---
  
  const app = await NestFactory.create(AppModule);

  app.useWebSocketAdapter(new IoAdapter(app));

  const configService: ConfigService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const adminUrl = configService.get<string>('ADMIN_URL');

  // Whitelist of allowed origins for CORS.
  const whitelist = [
    'https://cryptocraft-frontend.onrender.com', // Production Frontend
    'https://administrator-wusk.onrender.com',  // Production Admin
    'http://localhost:3000', // Local frontend dev
    'http://localhost:5173', // Local admin dev (default Vite)
  ];

  // Add URLs from environment variables if they exist to allow flexibility
  if (frontendUrl && !whitelist.includes(frontendUrl)) {
    whitelist.push(frontendUrl);
  }
  if (adminUrl && !whitelist.includes(adminUrl)) {
    whitelist.push(adminUrl);
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      // and requests from whitelisted origins.
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // Log the rejected origin for debugging purposes.
        console.warn(`CORS: Origin ${origin} rejected. Allowed origins are: ${whitelist.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });


  // Increase payload limits
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

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