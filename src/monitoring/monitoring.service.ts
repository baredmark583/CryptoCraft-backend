import { Injectable } from '@nestjs/common';
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from 'prom-client';

@Injectable()
export class MonitoringService {
  private readonly register: Registry;
  readonly httpRequestsCounter: Counter<string>;
  readonly httpDurationHistogram: Histogram<string>;

  constructor() {
    this.register = new Registry();
    collectDefaultMetrics({ register: this.register, prefix: 'cryptocraft_' });

    this.httpRequestsCounter = new Counter({
      name: 'cryptocraft_http_requests_total',
      help: 'Total number of HTTP requests received',
      labelNames: ['method', 'route', 'status'],
      registers: [this.register],
    });

    this.httpDurationHistogram = new Histogram({
      name: 'cryptocraft_http_request_duration_ms',
      help: 'Duration of HTTP requests in milliseconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [25, 50, 100, 250, 500, 1000, 2000, 5000],
      registers: [this.register],
    });
  }

  async getMetrics(): Promise<string> {
    return this.register.metrics();
  }
}
