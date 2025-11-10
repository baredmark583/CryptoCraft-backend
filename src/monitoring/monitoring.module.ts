import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { LogBufferService } from './log-buffer.service';

@Module({
  providers: [MonitoringService, LogBufferService],
  controllers: [MonitoringController],
  exports: [MonitoringService, LogBufferService],
})
export class MonitoringModule {}
