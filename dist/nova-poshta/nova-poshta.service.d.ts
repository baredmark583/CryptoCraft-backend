import { ConfigService } from '@nestjs/config';
export declare class NovaPoshtaService {
    private readonly configService;
    private readonly apiKey;
    private readonly apiUrl;
    private readonly logger;
    constructor(configService: ConfigService);
    private makeRequest;
    findCities(search: string): Promise<any>;
    findWarehouses(cityRef: string, search: string): Promise<any>;
}
