import { BaseEntity } from '../../database/base.entity';
import { Order } from '../../orders/entities/order.entity';
export interface DisputeMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    timestamp: number;
    text?: string;
    imageUrl?: string;
}
export type DisputePriority = 'LOW' | 'NORMAL' | 'URGENT';
export type DisputeTier = 'LEVEL1' | 'LEVEL2' | 'SUPERVISOR';
export type DisputeAutoAction = 'NONE' | 'AUTO_RELEASE' | 'AUTO_REFUND' | 'AUTO_ESCALATE';
export interface DisputeResolutionTemplate {
    id: string;
    title: string;
    body: string;
    action: 'REFUND_BUYER' | 'RELEASE_FUNDS' | 'PARTIAL_REFUND';
}
export interface DisputeAutomationLogEntry {
    id: string;
    type: 'SLA_BREACH' | 'AUTO_RELEASE' | 'AUTO_REFUND' | 'AUTO_ESCALATE';
    message: string;
    createdAt: string;
}
export interface DisputeInternalNote {
    id: string;
    authorId: string;
    authorName: string;
    note: string;
    createdAt: string;
}
export declare class Dispute extends BaseEntity {
    order: Order;
    status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_BUYER' | 'RESOLVED_SELLER';
    messages: DisputeMessage[];
    priority: DisputePriority;
    assignedTier: DisputeTier;
    assignedArbitratorId?: string;
    responseSlaDueAt?: Date;
    lastAgentResponseAt?: Date;
    slaBreachCount: number;
    pendingAutoAction: DisputeAutoAction;
    pendingAutoActionAt?: Date;
    automationLog: DisputeAutomationLogEntry[];
    resolutionTemplates: DisputeResolutionTemplate[];
    internalNotes: DisputeInternalNote[];
}
