import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MonitoringService } from '../../monitoring/monitoring.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly monitoringService: MonitoringService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const routePath = request?.route?.path || request.originalUrl || request.url || 'unknown';
    const method = request.method || 'UNKNOWN';
    const stopTimer = this.monitoringService.httpDurationHistogram.startTimer({
      method,
      route: routePath,
    });

    return next.handle().pipe(
      tap(() => {
        const status = response.statusCode || 200;
        this.monitoringService.httpRequestsCounter.inc({ method, route: routePath, status });
        stopTimer({ status });
      }),
      catchError((error) => {
        const status = error?.status || response.statusCode || 500;
        this.monitoringService.httpRequestsCounter.inc({ method, route: routePath, status });
        stopTimer({ status });
        return throwError(() => error);
      }),
    );
  }
}
