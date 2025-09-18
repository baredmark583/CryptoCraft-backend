import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Включаем глобальную валидацию для всех входящих данных
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Автоматически удалять свойства, которых нет в DTO
    transform: true, // Автоматически преобразовывать типы (например, string из запроса в number)
  }));

  // Включаем CORS для взаимодействия с фронтендом
  app.enableCors();
  
  await app.listen(3001);
  console.log(`Backend is running on: http://localhost:3001`);
}
bootstrap();