import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { Request } from 'express';
import { LogBufferService } from '../../monitoring/log-buffer.service';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: PinoLogger,
    private readonly logBuffer: LogBufferService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request & { id?: string }>();
    const response = context.switchToHttp().getResponse();
    const { method, originalUrl, ip } = request as any;
    const traceId = (request as any).id;
    const start = process.hrtime.bigint();

    this.logger.assign({ traceId });
    this.logger.info({ method, url: originalUrl, traceId, ip }, 'http_request_start');

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
          const duration = Number(durationMs.toFixed(2));
          this.logger.info(
            {
              method,
              url: originalUrl,
              statusCode: response.statusCode,
              durationMs: duration,
              traceId,
            },
            'http_request_complete',
          );
          this.logBuffer.addEntry({
            level: 'INFO',
            message: `${method} ${originalUrl} → ${response.statusCode}`,
            meta: { statusCode: response.statusCode, durationMs: duration, traceId },
          });
        },
        error: (error) => {
          const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
          const duration = Number(durationMs.toFixed(2));
          const statusCode = error?.status || response.statusCode || 500;
          this.logger.error(
            {
              method,
              url: originalUrl,
              statusCode,
              durationMs: duration,
              traceId,
              message: error?.message,
            },
            'http_request_error',
          );
          this.logBuffer.addEntry({
            level: 'ERROR',
            message: `${method} ${originalUrl} → ${statusCode}`,
            meta: { durationMs: duration, traceId, error: error?.message },
          });
        },
      }),
    );
  }
}
