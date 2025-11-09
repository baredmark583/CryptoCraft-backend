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
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const nestjs_pino_1 = require("nestjs-pino");
const trace_id_middleware_1 = require("../middleware/trace-id.middleware");
let AllExceptionsFilter = class AllExceptionsFilter {
    constructor(logger) {
        this.logger = logger;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const traceId = request?.headers?.[trace_id_middleware_1.TRACE_HEADER] || request?.id || (0, crypto_1.randomUUID)();
        response?.setHeader?.(trace_id_middleware_1.TRACE_HEADER, traceId);
        const isHttp = exception instanceof common_1.HttpException;
        const status = isHttp ? exception.getStatus() : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = isHttp ? exception.message : 'Internal server error';
        const details = isHttp ? exception.getResponse() : undefined;
        this.logger.error({
            traceId,
            status,
            path: request?.originalUrl ?? request?.url,
            method: request?.method,
            message,
        }, 'http_request_failed');
        response.status(status).json({
            code: status,
            message,
            details,
            traceId,
        });
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)(),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_pino_1.Logger])
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map