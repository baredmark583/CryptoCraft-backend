import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl, ip, headers, user, body } = req;
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        // Basic audit to console; can be redirected to DB/log service
        // eslint-disable-next-line no-console
        console.log('[AUDIT]', {
          ts: new Date().toISOString(),
          method,
          url: originalUrl,
          ms: Date.now() - start,
          userId: user?.userId,
          role: user?.role,
          ip,
          ua: headers['user-agent'],
          body,
        });
      }),
    );
  }
}


