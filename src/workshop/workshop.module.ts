import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkshopService } from './workshop.service';
import { WorkshopController } from './workshop.controller';
import { WorkshopPost } from './entities/workshop-post.entity';
import { WorkshopComment } from './entities/workshop-comment.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkshopPost, WorkshopComment, User])],
  controllers: [WorkshopController],
  providers: [WorkshopService],
})
export class WorkshopModule {}