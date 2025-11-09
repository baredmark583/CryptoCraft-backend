import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LivestreamsService } from './livestreams.service';
import { LivestreamsController } from './livestreams.controller';
import { Livestream } from './entities/livestream.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Livestream, User, Product]), 
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [LivestreamsController],
  providers: [LivestreamsService],
  exports: [LivestreamsService],
})
export class LivestreamsModule {}
