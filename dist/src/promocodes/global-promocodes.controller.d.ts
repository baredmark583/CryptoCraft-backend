import { GlobalPromoCodesService } from './global-promocodes.service';
import { CreateGlobalPromoCodeDto } from './dto/create-global-promocode.dto';
import { UpdateGlobalPromoCodeDto } from './dto/update-global-promocode.dto';
export declare class GlobalPromoCodesController {
    private readonly globalPromoCodesService;
    constructor(globalPromoCodesService: GlobalPromoCodesService);
    findAll(): Promise<import("./entities/global-promocode.entity").GlobalPromoCode[]>;
    create(dto: CreateGlobalPromoCodeDto, req: any): Promise<import("./entities/global-promocode.entity").GlobalPromoCode>;
    update(id: string, dto: UpdateGlobalPromoCodeDto, req: any): Promise<import("./entities/global-promocode.entity").GlobalPromoCode>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
