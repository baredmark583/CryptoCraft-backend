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
exports.MetricsInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const monitoring_service_1 = require("../../monitoring/monitoring.service");
let MetricsInterceptor = class MetricsInterceptor {
    constructor(monitoringService) {
        this.monitoringService = monitoringService;
    }
    intercept(context, next) {
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
        return next.handle().pipe((0, operators_1.tap)(() => {
            const status = response.statusCode || 200;
            this.monitoringService.httpRequestsCounter.inc({ method, route: routePath, status });
            stopTimer({ status });
        }), (0, operators_1.catchError)((error) => {
            const status = error?.status || response.statusCode || 500;
            this.monitoringService.httpRequestsCounter.inc({ method, route: routePath, status });
            stopTimer({ status });
            return (0, rxjs_1.throwError)(() => error);
        }));
    }
};
exports.MetricsInterceptor = MetricsInterceptor;
exports.MetricsInterceptor = MetricsInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService])
], MetricsInterceptor);
//# sourceMappingURL=metrics.interceptor.js.map