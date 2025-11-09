import { Module } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { ScrapingModule } from '../scraping/scraping.module';
import { AiModule } from '../ai/ai.module';
import { UploadModule } from '../upload/upload.module';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [ScrapingModule, AiModule, UploadModule, CategoriesModule],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}
