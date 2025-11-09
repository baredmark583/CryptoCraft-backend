import { LivestreamsService } from './livestreams.service';
import { CreateLivestreamDto } from './dto/create-livestream.dto';
import { JwtService } from '@nestjs/jwt';
import { FlagLivestreamDto } from './dto/flag-livestream.dto';
import { AttachRecordingDto } from './dto/attach-recording.dto';
export declare class LivestreamsController {
    private readonly livestreamsService;
    private readonly jwtService;
    constructor(livestreamsService: LivestreamsService, jwtService: JwtService);
    create(req: any, createLivestreamDto: CreateLivestreamDto): Promise<import("./entities/livestream.entity").Livestream>;
    findAll(): Promise<import("./entities/livestream.entity").Livestream[]>;
    findOne(id: string): Promise<import("./entities/livestream.entity").Livestream>;
    generateToken(req: any, id: string): Promise<{
        token: string;
    }>;
    endStream(req: any, id: string): Promise<import("./entities/livestream.entity").Livestream>;
    flagStream(req: any, id: string, dto: FlagLivestreamDto): Promise<{
        status: string;
    }>;
    attachRecording(req: any, id: string, dto: AttachRecordingDto): Promise<import("./entities/livestream.entity").Livestream>;
    getAnalytics(req: any, id: string): Promise<import("./entities/livestream.entity").Livestream>;
}
