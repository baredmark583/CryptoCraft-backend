import { ImportService } from './import.service';
import { ProcessUrlDto } from './dto/process-url.dto';
export declare class ImportController {
    private readonly importService;
    constructor(importService: ImportService);
    processUrl(processUrlDto: ProcessUrlDto): Promise<import("../types").ImportedListingData>;
}
