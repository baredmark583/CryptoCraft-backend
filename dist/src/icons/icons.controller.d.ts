import { IconsService } from './icons.service';
import { CreateIconDto } from './dto/create-icon.dto';
import { UpdateIconDto } from './dto/update-icon.dto';
import { SyncIconsDto } from './dto/sync-icons.dto';
export declare class IconsController {
    private readonly iconsService;
    constructor(iconsService: IconsService);
    findAllPublic(): Promise<import("./entities/icon.entity").Icon[]>;
    create(createIconDto: CreateIconDto): Promise<import("./entities/icon.entity").Icon>;
    upsert(upsertIconDto: CreateIconDto): Promise<import("./entities/icon.entity").Icon>;
    syncMissing(syncIconsDto: SyncIconsDto): Promise<{
        created: number;
    }>;
    findAll(): Promise<import("./entities/icon.entity").Icon[]>;
    findOne(id: string): Promise<import("./entities/icon.entity").Icon>;
    update(id: string, updateIconDto: UpdateIconDto): Promise<import("./entities/icon.entity").Icon>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
