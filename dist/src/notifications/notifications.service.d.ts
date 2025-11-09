import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { PromoCode } from '../promocodes/entities/promocode.entity';
export declare class NotificationsService {
    private readonly notificationRepository;
    private readonly userRepository;
    constructor(notificationRepository: Repository<Notification>, userRepository: Repository<User>);
    findByUserId(userId: string): Promise<Notification[]>;
    markAllAsRead(userId: string): Promise<void>;
    createPersonalOffer(senderId: string, recipientId: string, product: Product, promoCode: PromoCode): Promise<Notification>;
}
