import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { MoreThan, Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Dispute } from '../disputes/entities/dispute.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(Dispute)
        private readonly disputeRepository: Repository<Dispute>,
    ) {}

    async getDashboardData() {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // KPIs
        const todayOrders = await this.orderRepository.find({
            where: { createdAt: MoreThanOrEqual(todayStart) }
        });
        const totalRevenueToday = todayOrders.reduce((sum, order) => sum + order.total, 0);
        const newOrdersToday = todayOrders.length;

        const profitResult = await this.orderRepository.createQueryBuilder("order")
            .select("SUM(order.total)", "totalSum")
            .where("order.status = :status", { status: 'COMPLETED' })
            .getRawOne();
        const totalSum = profitResult?.totalSum ? parseFloat(profitResult.totalSum) : 0;
        const platformProfit = totalSum * 0.02;


        const productsForModeration = await this.productRepository.count({
            where: { status: 'Pending Moderation' }
        });
        
        const activeDisputes = await this.disputeRepository.count({
            where: [{ status: 'OPEN' }, { status: 'UNDER_REVIEW' }]
        });
        
        // Sales Chart Data
        const recentOrders = await this.orderRepository.find({
            where: { createdAt: MoreThan(thirtyDaysAgo) }
        });
        
        const salesByDay = new Map<string, number>();
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
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
            .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

        // Recent Activity
        const recentUsers = await this.userRepository.find({ order: { createdAt: 'DESC' }, take: 2 });
        const lastOrders = await this.orderRepository.find({ order: { createdAt: 'DESC' }, take: 3, relations: ['buyer'] });

        const rawActivities = [
            ...lastOrders.filter(o => o.buyer).map(o => ({
                id: `order-${o.id}`,
                type: 'new_order' as const,
                text: `Новый заказ от ${o.buyer.name} на ${o.total.toFixed(2)} USDT`,
                timestamp: o.createdAt.getTime()
            })),
            ...recentUsers.map(u => ({
                id: `user-${u.id}`,
                type: 'new_user' as const,
                text: `Новый пользователь ${u.name}`,
                timestamp: u.createdAt.getTime()
            }))
        ];
        
        const recentActivity = rawActivities
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5)
            .map(activity => ({
                ...activity,
                time: `${Math.floor((Date.now() - activity.timestamp) / 60000)} минут назад`
            }));


        // Top Sellers
        const topSellersData = await this.orderRepository
            .createQueryBuilder("order_entity")
            .innerJoin("order_entity.seller", "seller")
            .select("seller.id", "id")
            .addSelect("seller.name", "name")
            .addSelect("seller.avatarUrl", "avatarUrl")
            .addSelect("SUM(order_entity.total)", "totalRevenue")
            .addSelect("COUNT(order_entity.id)", "salesCount")
            .where("order_entity.createdAt > :date", { date: thirtyDaysAgo })
            .groupBy("seller.id, seller.name, seller.avatarUrl")
            .orderBy("totalRevenue", "DESC")
            .limit(5)
            .getRawMany();


        return {
            kpis: {
                totalRevenueToday,
                platformProfit,
                newOrdersToday,
                productsForModeration,
                activeDisputes,
            },
            salesData,
            recentActivity,
            topSellers: topSellersData.map(s => ({...s, totalRevenue: parseFloat(s.totalRevenue), salesCount: parseInt(s.salesCount, 10)})),
        };
    }
}