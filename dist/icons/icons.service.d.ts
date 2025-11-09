import { Repository } from 'typeorm';
import { CreateIconDto } from './dto/create-icon.dto';
import { UpdateIconDto } from './dto/update-icon.dto';
import { Icon } from './entities/icon.entity';
export declare class IconsService {
    private readonly iconRepository;
    constructor(iconRepository: Repository<Icon>);
    private fetchSvgFromUrl;
    create(createIconDto: CreateIconDto): Promise<Icon>;
    upsert(upsertIconDto: CreateIconDto): Promise<Icon>;
    findAll(): Promise<Icon[]>;
    findOne(id: string): Promise<Icon>;
    update(id: string, updateIconDto: UpdateIconDto): Promise<Icon>;
    syncMissing(iconDtos: CreateIconDto[]): Promise<{
        created: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
