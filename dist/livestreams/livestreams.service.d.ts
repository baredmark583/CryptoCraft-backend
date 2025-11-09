import { Repository } from 'typeorm';
import { Livestream } from './entities/livestream.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { CreateLivestreamDto } from './dto/create-livestream.dto';
import { ConfigService } from '@nestjs/config';
import { FlagLivestreamDto } from './dto/flag-livestream.dto';
import { AttachRecordingDto } from './dto/attach-recording.dto';
export declare class LivestreamsService {
    private readonly livestreamRepository;
    private readonly userRepository;
    private readonly productRepository;
    private readonly configService;
    constructor(livestreamRepository: Repository<Livestream>, userRepository: Repository<User>, productRepository: Repository<Product>, configService: ConfigService);
    create(sellerId: string, createDto: CreateLivestreamDto): Promise<Livestream>;
    findAll(): Promise<Livestream[]>;
    findOne(id: string): Promise<Livestream>;
    generateJoinToken(streamId: string, user: {
        userId: string;
        username: string;
    } | null): Promise<string>;
    endStream(id: string, userId: string, userRole: UserRole): Promise<Livestream>;
    recordViewerSnapshot(streamId: string, viewerCount: number): Promise<void>;
    flagLivestream(streamId: string, reporterId: string | null, dto: FlagLivestreamDto): Promise<void>;
    attachRecording(streamId: string, dto: AttachRecordingDto, userId: string): Promise<Livestream>;
    getAnalytics(streamId: string, requester: {
        id: string;
        role: UserRole;
    }): Promise<Livestream>;
}
