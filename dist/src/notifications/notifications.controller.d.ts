import { NotificationsService } from './notifications.service';
import { ProductsService } from 'src/products/products.service';
import { PromoCodesService } from 'src/promocodes/promocodes.service';
import { PersonalOfferDto } from './dto/personal-offer.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    private readonly productsService;
    private readonly promoCodesService;
    constructor(notificationsService: NotificationsService, productsService: ProductsService, promoCodesService: PromoCodesService);
    getNotifications(req: any): Promise<import("./entities/notification.entity").Notification[]>;
    markAllAsRead(req: any): Promise<void>;
    sendPersonalOffer(req: any, offerDto: PersonalOfferDto): Promise<import("./entities/notification.entity").Notification>;
}
