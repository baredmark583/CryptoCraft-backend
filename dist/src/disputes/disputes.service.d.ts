import { Repository } from 'typeorm';
import { Dispute } from './entities/dispute.entity';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { DisputeReportDto } from './dto/dispute-report.dto';
export declare class DisputesService {
    private readonly disputeRepository;
    private readonly prioritySlaHours;
    constructor(disputeRepository: Repository<Dispute>);
    findAll(): Promise<Dispute[]>;
    findOne(id: string): Promise<Dispute>;
    update(id: string, updateDisputeDto: UpdateDisputeDto): Promise<Dispute>;
    getReport(): Promise<DisputeReportDto>;
    private computeNextSla;
    private isOpen;
    private buildAutomationLogEntry;
    private refreshDispute;
    private executeAutoAction;
}
