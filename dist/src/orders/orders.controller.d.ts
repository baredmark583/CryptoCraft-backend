import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, req: any): Promise<{
        success: boolean;
    }>;
    findAllAdmin(): Promise<import("./entities/order.entity").Order[]>;
    findPurchases(req: any): Promise<import("./entities/order.entity").Order[]>;
    findSales(req: any): Promise<import("./entities/order.entity").Order[]>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<import("./entities/order.entity").Order>;
    generateWaybill(id: string): Promise<import("./entities/order.entity").Order>;
}
