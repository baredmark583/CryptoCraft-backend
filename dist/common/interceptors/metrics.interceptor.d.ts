import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MonitoringService } from '../../monitoring/monitoring.service';
export declare class MetricsInterceptor implements NestInterceptor {
    private readonly monitoringService;
    constructor(monitoringService: MonitoringService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
