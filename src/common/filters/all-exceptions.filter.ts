import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';
import { TRACE_HEADER } from '../middleware/trace-id.middleware';

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const traceId = request?.headers?.[TRACE_HEADER] || request?.id || randomUUID();
    response?.setHeader?.(TRACE_HEADER, traceId);

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? (exception as HttpException).getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isHttp ? (exception as HttpException).message : 'Internal server error';
    const details = isHttp ? (exception as HttpException).getResponse() : undefined;

    this.logger.error(
      {
        traceId,
        status,
        path: request?.originalUrl ?? request?.url,
        method: request?.method,
        message,
      },
      'http_request_failed',
    );

    response.status(status).json({
      code: status,
      message,
      details,
      traceId,
    });
  }
}


