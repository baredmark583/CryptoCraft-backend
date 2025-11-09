import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/entities/user.entity';
import { UpdateOrderDto } from './dto/update-order.dto';
import { TelegramService } from '../telegram/telegram.service';
import { EscrowService } from '../escrow/escrow.service';
export declare class OrdersService {
    private dataSource;
    private readonly orderRepository;
    private readonly userRepository;
    private readonly telegramService;
    private readonly escrowService;
    constructor(dataSource: DataSource, orderRepository: Repository<Order>, userRepository: Repository<User>, telegramService: TelegramService, escrowService: EscrowService);
    create(createOrderDto: CreateOrderDto, buyerId: string): Promise<{
        success: boolean;
    }>;
    findAll(): Promise<Order[]>;
    findPurchases(userId: string): Promise<Order[]>;
    findSales(userId: string): Promise<Order[]>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order>;
    generateWaybill(id: string): Promise<Order>;
}
