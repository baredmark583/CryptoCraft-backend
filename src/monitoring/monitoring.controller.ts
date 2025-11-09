import { Controller, Get, Header } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';

@Controller('metrics')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  async getMetrics(): Promise<string> {
    return this.monitoringService.getMetrics();
  }
}
