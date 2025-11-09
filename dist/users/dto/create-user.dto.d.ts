import { ShippingAddress, BusinessInfo } from '../entities/user.entity';
export declare class CreateUserDto {
    telegramId: number;
    name: string;
    email?: string;
    avatarUrl?: string;
    headerImageUrl?: string;
    rating?: number;
    following?: string[];
    balance?: number;
    commissionOwed?: number;
    affiliateId?: string;
    phoneNumber?: string;
    defaultShippingAddress?: ShippingAddress;
    businessInfo?: BusinessInfo;
    tonWalletAddress?: string;
    paymentCard?: string;
}
