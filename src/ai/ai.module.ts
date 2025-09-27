import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [ConfigModule, CategoriesModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}