import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Dispute,
  DisputePriority,
  DisputeAutomationLogEntry,
  DisputeAutoAction,
} from './entities/dispute.entity';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { DisputeReportDto } from './dto/dispute-report.dto';

@Injectable()
export class DisputesService {
  private readonly prioritySlaHours: Record<DisputePriority, number> = {
    LOW: 48,
    NORMAL: 24,
    URGENT: 8,
  };

  constructor(
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
  ) {}

  async findAll(): Promise<Dispute[]> {
    const disputes = await this.disputeRepository.find({
      relations: ['order', 'order.buyer', 'order.seller', 'order.items', 'order.items.product'],
      order: { createdAt: 'DESC' },
    });
    return Promise.all(disputes.map((dispute) => this.refreshDispute(dispute)));
  }

  async findOne(id: string): Promise<Dispute> {
    const dispute = await this.disputeRepository.findOne({
      where: { id },
      relations: ['order', 'order.buyer', 'order.seller', 'order.items', 'order.items.product'],
    });
    if (!dispute) {
      throw new NotFoundException(`Dispute with ID ${id} not found`);
    }
    return this.refreshDispute(dispute);
  }

  async update(id: string, updateDisputeDto: UpdateDisputeDto): Promise<Dispute> {
    const existing = await this.disputeRepository.findOne({
      where: { id },
      relations: ['order', 'order.buyer', 'order.seller', 'order.items', 'order.items.product'],
    });
    if (!existing) {
      throw new NotFoundException(`Dispute with ID ${id} not found`);
    }

    const merged = this.disputeRepository.merge(existing, updateDisputeDto);
    const messagesWereUpdated =
      Array.isArray(updateDisputeDto.messages) &&
      updateDisputeDto.messages.length !== (existing.messages?.length || 0);

    if (messagesWereUpdated || updateDisputeDto.status === 'UNDER_REVIEW') {
      merged.lastAgentResponseAt = new Date();
      merged.responseSlaDueAt = this.computeNextSla(merged.priority);
    }

    if (updateDisputeDto.priority && updateDisputeDto.priority !== existing.priority) {
      merged.responseSlaDueAt = this.computeNextSla(updateDisputeDto.priority);
    }

    if (
      updateDisputeDto.status &&
      (updateDisputeDto.status === 'RESOLVED_BUYER' || updateDisputeDto.status === 'RESOLVED_SELLER')
    ) {
      merged.pendingAutoAction = 'NONE';
      merged.pendingAutoActionAt = null;
    }

    const savedDispute = await this.disputeRepository.save(merged);
    return this.findOne(savedDispute.id);
  }

  async getReport(): Promise<DisputeReportDto> {
    const disputes = await this.disputeRepository.find();
    const open = disputes.filter((d) => this.isOpen(d.status)).length;
    const resolvedBuyer = disputes.filter((d) => d.status === 'RESOLVED_BUYER').length;
    const resolvedSeller = disputes.filter((d) => d.status === 'RESOLVED_SELLER').length;
    const resolved = disputes.filter((d) => d.status.startsWith('RESOLVED'));
    const averageResolutionHours =
      resolved.length > 0
        ? resolved.reduce((sum, dispute) => {
            const end = dispute.updatedAt ?? dispute.createdAt;
            return sum + (end.getTime() - dispute.createdAt.getTime()) / 36e5;
          }, 0) / resolved.length
        : 0;
    const priorityBreakdown = disputes.reduce(
      (acc, dispute) => {
        acc[dispute.priority] = (acc[dispute.priority] || 0) + 1;
        return acc;
      },
      { LOW: 0, NORMAL: 0, URGENT: 0 } as Record<DisputePriority, number>,
    );
    const slaBreaches = disputes.reduce((sum, dispute) => sum + (dispute.slaBreachCount || 0), 0);
    const autoActionsExecuted = disputes.reduce(
      (sum, dispute) =>
        sum + (dispute.automationLog || []).filter((entry) => entry.type !== 'SLA_BREACH').length,
      0,
    );

    return {
      total: disputes.length,
      open,
      resolvedBuyer,
      resolvedSeller,
      averageResolutionHours: Number(averageResolutionHours.toFixed(1)),
      slaBreaches,
      priorityBreakdown,
      autoActionsExecuted,
    };
  }

  private computeNextSla(priority: DisputePriority): Date {
    const hours = this.prioritySlaHours[priority] ?? this.prioritySlaHours.NORMAL;
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  private isOpen(status: Dispute['status']) {
    return status === 'OPEN' || status === 'UNDER_REVIEW';
  }

  private buildAutomationLogEntry(type: DisputeAutomationLogEntry['type'], message: string): DisputeAutomationLogEntry {
    return {
      id: `auto-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      message,
      createdAt: new Date().toISOString(),
    };
  }

  private async refreshDispute(dispute: Dispute): Promise<Dispute> {
    let dirty = false;
    if (!dispute.responseSlaDueAt) {
      dispute.responseSlaDueAt = this.computeNextSla(dispute.priority);
      dirty = true;
    }

    if (this.isOpen(dispute.status) && dispute.responseSlaDueAt && dispute.responseSlaDueAt.getTime() < Date.now()) {
      dispute.slaBreachCount = (dispute.slaBreachCount || 0) + 1;
      dispute.responseSlaDueAt = this.computeNextSla(dispute.priority);
      dispute.automationLog = [
        ...(dispute.automationLog || []),
        this.buildAutomationLogEntry('SLA_BREACH', `SLA breach detected (${dispute.priority})`),
      ];
      dirty = true;
      if (dispute.pendingAutoAction === 'NONE') {
        dispute.pendingAutoAction = 'AUTO_ESCALATE';
        dispute.pendingAutoActionAt = new Date(Date.now() + 60 * 60 * 1000);
      }
    }

    if (
      dispute.pendingAutoAction !== 'NONE' &&
      dispute.pendingAutoActionAt &&
      dispute.pendingAutoActionAt.getTime() <= Date.now()
    ) {
      await this.executeAutoAction(dispute);
      dirty = true;
    }

    return dirty ? this.disputeRepository.save(dispute) : dispute;
  }

  private async executeAutoAction(dispute: Dispute): Promise<Dispute> {
    const action: DisputeAutoAction = dispute.pendingAutoAction;
    if (action === 'NONE') {
      return dispute;
    }

    switch (action) {
      case 'AUTO_RELEASE':
        dispute.status = 'RESOLVED_SELLER';
        break;
      case 'AUTO_REFUND':
        dispute.status = 'RESOLVED_BUYER';
        break;
      case 'AUTO_ESCALATE':
        dispute.assignedTier = 'SUPERVISOR';
        dispute.responseSlaDueAt = this.computeNextSla('URGENT');
        break;
      default:
        break;
    }

    dispute.pendingAutoAction = 'NONE';
    dispute.pendingAutoActionAt = null;
    dispute.automationLog = [
      ...(dispute.automationLog || []),
      this.buildAutomationLogEntry(
        action === 'AUTO_ESCALATE'
          ? 'AUTO_ESCALATE'
          : action === 'AUTO_REFUND'
          ? 'AUTO_REFUND'
          : 'AUTO_RELEASE',
        `Automation executed: ${action}`,
      ),
    ];
    return this.disputeRepository.save(dispute);
  }
}
