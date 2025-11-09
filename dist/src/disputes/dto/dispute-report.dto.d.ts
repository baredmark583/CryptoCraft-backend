import { DisputePriority } from '../entities/dispute.entity';
export interface DisputeReportDto {
    total: number;
    open: number;
    resolvedBuyer: number;
    resolvedSeller: number;
    averageResolutionHours: number;
    slaBreaches: number;
    priorityBreakdown: Record<DisputePriority, number>;
    autoActionsExecuted: number;
}
