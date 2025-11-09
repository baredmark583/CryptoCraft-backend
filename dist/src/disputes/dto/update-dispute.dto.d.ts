import { DisputeMessage, DisputePriority, DisputeTier, DisputeAutoAction, DisputeResolutionTemplate, DisputeInternalNote } from '../entities/dispute.entity';
export declare class UpdateDisputeDto {
    status?: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_BUYER' | 'RESOLVED_SELLER';
    messages?: DisputeMessage[];
    priority?: DisputePriority;
    assignedTier?: DisputeTier;
    assignedArbitratorId?: string;
    responseSlaDueAt?: string;
    pendingAutoAction?: DisputeAutoAction;
    pendingAutoActionAt?: string;
    resolutionTemplates?: DisputeResolutionTemplate[];
    internalNotes?: DisputeInternalNote[];
}
