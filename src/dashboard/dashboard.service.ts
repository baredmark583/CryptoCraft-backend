import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { MoreThan, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
    ) {}

    async getDashboardData() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // KPIs
        const completedOrders = await this.orderRepository.find({
            where: { status: 'COMPLETED' }
        });
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
        const platformProfit = totalRevenue * 0.02; // Assuming 2% commission

        const newUsers = await this.userRepository.count({
            where: { createdAt: MoreThan(thirtyDaysAgo) }
        });

        const productsForModeration = await this.productRepository.count({
            where: { status: 'Pending Moderation' }
        });
        
        // Sales Chart Data
        const recentOrders = await this.orderRepository.find({
            where: { createdAt: MoreThan(thirtyDaysAgo) }
        });
        
        const salesByDay = new Map<string, number>();
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
            salesByDay.set(dateString, 0);
        }

        recentOrders.forEach(order => {
            const dateString = new Date(order.createdAt).toISOString().split('T')[0];
            if (salesByDay.has(dateString)) {
                salesByDay.set(dateString, salesByDay.get(dateString) + order.total);
            }
        });

        const salesData = Array.from(salesByDay.entries())
            .map(([name, sales]) => ({ name, sales }))
            .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime()); // Sort chronologically

        return {
            kpis: {
                totalRevenue,
                platformProfit,
                newUsers,
                productsForModeration,
            },
            salesData,
        };
    }
}