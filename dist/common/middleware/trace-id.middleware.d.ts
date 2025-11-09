import type { Request, Response, NextFunction } from 'express';
export declare const TRACE_HEADER = "x-trace-id";
export declare function traceIdMiddleware(req: Request & {
    id?: string;
}, res: Response, next: NextFunction): void;
