import { Order } from '../orders/entities/order.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Dispute } from '../disputes/entities/dispute.entity';
export declare class DashboardService {
    private readonly orderRepository;
    private readonly userRepository;
    private readonly productRepository;
    private readonly disputeRepository;
    constructor(orderRepository: Repository<Order>, userRepository: Repository<User>, productRepository: Repository<Product>, disputeRepository: Repository<Dispute>);
    getDashboardData(): Promise<{
        kpis: {
            totalRevenueToday: number;
            platformProfit: number;
            newOrdersToday: number;
            productsForModeration: number;
            activeDisputes: number;
        };
        salesData: {
            name: string;
            sales: number;
        }[];
        recentActivity: ({
            time: string;
            id: string;
            type: "new_order";
            text: string;
            timestamp: number;
        } | {
            time: string;
            id: string;
            type: "new_user";
            text: string;
            timestamp: number;
        })[];
        topSellers: {
            id: string;
            name: string;
            avatarUrl: string;
            totalRevenue: number;
            salesCount: number;
        }[];
    }>;
}
