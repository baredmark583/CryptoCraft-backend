import { PromoCodesService } from './promocodes.service';
import { CreatePromoCodeDto } from './dto/create-promocode.dto';
import { ValidatePromoCodeDto } from './dto/validate-promocode.dto';
export declare class PromoCodesController {
    private readonly promoCodesService;
    constructor(promoCodesService: PromoCodesService);
    create(req: any, createDto: CreatePromoCodeDto): Promise<import("./entities/promocode.entity").PromoCode>;
    findBySeller(sellerId: string): Promise<import("./entities/promocode.entity").PromoCode[]>;
    validate(validateDto: ValidatePromoCodeDto): Promise<{
        discountValue: number;
        discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    }>;
    remove(req: any, id: string): Promise<void>;
}
