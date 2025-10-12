import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NovaPoshtaService } from './nova-poshta.service';
import { NovaPoshtaController } from './nova-poshta.controller';

@Module({
  imports: [ConfigModule],
  controllers: [NovaPoshtaController],
  providers: [NovaPoshtaService],
})
export class NovaPoshtaModule {}
