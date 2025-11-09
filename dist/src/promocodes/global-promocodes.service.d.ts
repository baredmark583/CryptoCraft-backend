import { Repository } from 'typeorm';
import { GlobalPromoCode } from './entities/global-promocode.entity';
import { CreateGlobalPromoCodeDto } from './dto/create-global-promocode.dto';
import { UpdateGlobalPromoCodeDto } from './dto/update-global-promocode.dto';
export declare class GlobalPromoCodesService {
    private readonly globalPromoCodeRepository;
    constructor(globalPromoCodeRepository: Repository<GlobalPromoCode>);
    findAll(): Promise<GlobalPromoCode[]>;
    create(dto: CreateGlobalPromoCodeDto, userId?: string): Promise<GlobalPromoCode>;
    update(id: string, dto: UpdateGlobalPromoCodeDto, userId?: string): Promise<GlobalPromoCode>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
