import { ScrapingService } from '../scraping/scraping.service';
import { AiService } from '../ai/ai.service';
import { UploadService } from '../upload/upload.service';
import { ImportedListingData } from '../types';
export declare class ImportService {
    private readonly scrapingService;
    private readonly aiService;
    private readonly uploadService;
    private readonly logger;
    constructor(scrapingService: ScrapingService, aiService: AiService, uploadService: UploadService);
    private convertCurrency;
    processUrl(url: string): Promise<ImportedListingData>;
}
