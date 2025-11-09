import type { Response } from 'express';
import { AuthService } from './auth.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { WebLoginDto } from './dto/web-login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    telegramLogin(telegramAuthDto: TelegramAuthDto, res: Response): Promise<{
        user: Partial<import("src/users/entities/user.entity").User>;
    }>;
    telegramWebLogin(webLoginDto: WebLoginDto, res: Response): Promise<{
        user: Partial<import("src/users/entities/user.entity").User>;
    }>;
    adminLogin(adminLoginDto: AdminLoginDto, res: Response): Promise<{
        user: Partial<import("src/users/entities/user.entity").User>;
    }>;
    getMe(req: any): Promise<import("src/users/entities/user.entity").User | Partial<import("src/users/entities/user.entity").User>>;
}
