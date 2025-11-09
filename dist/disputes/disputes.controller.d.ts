import { DisputesService } from './disputes.service';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
export declare class DisputesController {
    private readonly disputesService;
    constructor(disputesService: DisputesService);
    findAll(): Promise<import("./entities/dispute.entity").Dispute[]>;
    getReport(): Promise<import("./dto/dispute-report.dto").DisputeReportDto>;
    update(id: string, updateDisputeDto: UpdateDisputeDto): Promise<import("./entities/dispute.entity").Dispute>;
}
