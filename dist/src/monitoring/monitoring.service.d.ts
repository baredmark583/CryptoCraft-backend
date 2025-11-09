import { Counter, Histogram } from 'prom-client';
export declare class MonitoringService {
    private readonly register;
    readonly httpRequestsCounter: Counter<string>;
    readonly httpDurationHistogram: Histogram<string>;
    constructor();
    getMetrics(): Promise<string>;
}
