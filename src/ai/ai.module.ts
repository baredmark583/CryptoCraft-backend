import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from 'src/categories/categories.module';
import { ScrapingModule } from 'src/scraping/scraping.module';

@Module({
  imports: [ConfigModule, CategoriesModule, ScrapingModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}