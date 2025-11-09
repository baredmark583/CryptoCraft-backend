import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Observable } from 'rxjs';
export declare class RequestLoggerInterceptor implements NestInterceptor {
    private readonly logger;
    constructor(logger: PinoLogger);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
