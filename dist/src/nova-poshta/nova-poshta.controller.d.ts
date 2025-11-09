import { NovaPoshtaService } from './nova-poshta.service';
export declare class NovaPoshtaController {
    private readonly novaPoshtaService;
    constructor(novaPoshtaService: NovaPoshtaService);
    getCities(search: string): Promise<{
        data: any;
    }>;
    getWarehouses(cityRef: string, search: string): Promise<{
        data: any;
    }>;
}
