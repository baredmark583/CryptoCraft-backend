import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from 'src/users/entities/user.entity';
import { AdminLoginDto } from './dto/admin-login.dto';
import { WebLoginDto } from './dto/web-login.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    private readonly botToken;
    private failedAdminAttempts;
    private readonly maxAdminAttempts;
    private readonly lockoutMs;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    validateTelegramData(initData: string): Promise<User>;
    validateTelegramWebLogin(dto: WebLoginDto): Promise<User>;
    validateAdmin(adminLoginDto: AdminLoginDto): Promise<Partial<User>>;
    login(user: Partial<User>): Promise<{
        access_token: string;
        user: Partial<User>;
    }>;
    getMe(userId: string, userRole: UserRole): Promise<User | Partial<User>>;
}
