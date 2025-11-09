"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLoggerInterceptor = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
const operators_1 = require("rxjs/operators");
let RequestLoggerInterceptor = class RequestLoggerInterceptor {
    constructor(logger) {
        this.logger = logger;
    }
    intercept(context, next) {
        if (context.getType() !== 'http') {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const { method, originalUrl, ip } = request;
        const traceId = request.id;
        const start = process.hrtime.bigint();
        this.logger.assign({ traceId });
        this.logger.info({ method, url: originalUrl, traceId, ip }, 'http_request_start');
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
                this.logger.info({
                    method,
                    url: originalUrl,
                    statusCode: response.statusCode,
                    durationMs: Number(durationMs.toFixed(2)),
                    traceId,
                }, 'http_request_complete');
            },
            error: (error) => {
                const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
                this.logger.error({
                    method,
                    url: originalUrl,
                    statusCode: error?.status || response.statusCode || 500,
                    durationMs: Number(durationMs.toFixed(2)),
                    traceId,
                    message: error?.message,
                }, 'http_request_error');
            },
        }));
    }
};
exports.RequestLoggerInterceptor = RequestLoggerInterceptor;
exports.RequestLoggerInterceptor = RequestLoggerInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_pino_1.PinoLogger])
], RequestLoggerInterceptor);
//# sourceMappingURL=request-logger.interceptor.js.map