import { Controller, Get, Header, Query, UseGuards } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { LogBufferService } from './log-buffer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('metrics')
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly logBufferService: LogBufferService,
  ) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  async getMetrics(): Promise<string> {
    return this.monitoringService.getMetrics();
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  getLogs(@Query('since') since?: string) {
    const sinceId = since ? Number(since) : undefined;
    const parsed = Number.isFinite(sinceId) ? sinceId : undefined;
    return this.logBufferService.getEntries(parsed);
  }
}
