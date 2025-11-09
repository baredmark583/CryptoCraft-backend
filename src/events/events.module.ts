import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { ChatsModule } from 'src/chats/chats.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Livestream } from 'src/livestreams/entities/livestream.entity';
import { LivestreamsModule } from 'src/livestreams/livestreams.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Livestream]),
    ConfigModule,
    ChatsModule,
    LivestreamsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EventsGateway],
})
export class EventsModule {}
