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
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const prom_client_1 = require("prom-client");
let MonitoringService = class MonitoringService {
    constructor() {
        this.register = new prom_client_1.Registry();
        (0, prom_client_1.collectDefaultMetrics)({ register: this.register, prefix: 'cryptocraft_' });
        this.httpRequestsCounter = new prom_client_1.Counter({
            name: 'cryptocraft_http_requests_total',
            help: 'Total number of HTTP requests received',
            labelNames: ['method', 'route', 'status'],
            registers: [this.register],
        });
        this.httpDurationHistogram = new prom_client_1.Histogram({
            name: 'cryptocraft_http_request_duration_ms',
            help: 'Duration of HTTP requests in milliseconds',
            labelNames: ['method', 'route', 'status'],
            buckets: [25, 50, 100, 250, 500, 1000, 2000, 5000],
            registers: [this.register],
        });
    }
    async getMetrics() {
        return this.register.metrics();
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map