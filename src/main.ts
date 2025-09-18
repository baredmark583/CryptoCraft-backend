import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // FIX: Add explicit type argument to `app.get` to ensure `configService` is correctly typed.
  const configService = app.get<ConfigService>(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');

  // Включаем глобальную валидацию для всех входящих данных
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Автоматически удалять свойства, которых нет в DTO
    transform: true, // Автоматически преобразовывать типы (например, string из запроса в number)
  }));

  // Включаем CORS для взаимодействия с фронтендом
  if (frontendUrl) {
    app.enableCors({
      origin: frontendUrl,
    });
    console.log(`CORS enabled for origin: ${frontendUrl}`);
  } else {
    app.enableCors(); // Fallback for local development
    console.log('CORS enabled for all origins (development mode)');
  }

  // FIX: `configService` is now correctly typed, so this generic call is valid.
  const port = configService.get<number>('PORT') || 3001;
  
  await app.listen(port);
  console.log(`Backend is running on port: ${port}`);
}
bootstrap();