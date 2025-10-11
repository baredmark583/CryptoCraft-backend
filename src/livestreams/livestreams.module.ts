import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LivestreamsService } from './livestreams.service';
import { LivestreamsController } from './livestreams.controller';
import { Livestream } from './entities/livestream.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Livestream, User, Product]), ConfigModule],
  controllers: [LivestreamsController],
  providers: [LivestreamsService],
})
export class LivestreamsModule {}