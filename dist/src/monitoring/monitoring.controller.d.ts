import { MonitoringService } from './monitoring.service';
export declare class MonitoringController {
    private readonly monitoringService;
    constructor(monitoringService: MonitoringService);
    getMetrics(): Promise<string>;
}
