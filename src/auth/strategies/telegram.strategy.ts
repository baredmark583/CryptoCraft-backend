import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

// Определяем интерфейс для данных пользователя из Telegram
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

@Injectable()
export class TelegramStrategy extends PassportStrategy(Strategy, 'telegram') {
  constructor() {
    // В этой стратегии мы не используем стандартный механизм Passport,
    // так как проверка происходит вручную в auth.service.
    // Этот файл в основном служит для определения интерфейса TelegramUser.
    super();
  }
}
