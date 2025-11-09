import { OrderStatus } from '../entities/order.entity';
export declare class UpdateOrderDto {
    status?: OrderStatus;
    trackingNumber?: string;
}
