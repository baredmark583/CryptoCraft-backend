export declare class ScrapingService {
    private readonly logger;
    scrapeUrl(url: string): Promise<{
        html: string;
    }>;
}
