import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export const TRACE_HEADER = 'x-trace-id';

export function traceIdMiddleware(req: Request & { id?: string }, res: Response, next: NextFunction) {
  const incomingTraceId = (req.headers[TRACE_HEADER] as string) || req.header(TRACE_HEADER);
  const traceId = incomingTraceId || randomUUID();

  req.id = traceId;
  res.setHeader(TRACE_HEADER, traceId);

  next();
}
