"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const order_entity_1 = require("../orders/entities/order.entity");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const product_entity_1 = require("../products/entities/product.entity");
const dispute_entity_1 = require("../disputes/entities/dispute.entity");
let DashboardService = class DashboardService {
    constructor(orderRepository, userRepository, productRepository, disputeRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.disputeRepository = disputeRepository;
    }
    async getDashboardData() {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const todayOrders = await this.orderRepository.find({
            where: { createdAt: (0, typeorm_2.MoreThanOrEqual)(todayStart) }
        });
        const totalRevenueToday = todayOrders.reduce((sum, order) => sum + order.total, 0);
        const newOrdersToday = todayOrders.length;
        const profitableOrders = await this.orderRepository.find({
            where: [
                { status: 'COMPLETED' },
                { status: 'DELIVERED' }
            ]
        });
        const totalRevenueForProfit = profitableOrders.reduce((sum, order) => sum + order.total, 0);
        const platformProfit = totalRevenueForProfit * 0.02;
        const productsForModeration = await this.productRepository.count({
            where: { status: 'Pending Moderation' }
        });
        const activeDisputes = await this.disputeRepository.count({
            where: [{ status: 'OPEN' }, { status: 'UNDER_REVIEW' }]
        });
        const recentOrders = await this.orderRepository.find({
            where: { createdAt: (0, typeorm_2.MoreThan)(thirtyDaysAgo) }
        });
        const salesByDay = new Map();
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
        const recentUsers = await this.userRepository.find({ order: { createdAt: 'DESC' }, take: 2 });
        const lastOrders = await this.orderRepository.find({ order: { createdAt: 'DESC' }, take: 3, relations: ['buyer'] });
        const rawActivities = [
            ...lastOrders.filter(o => o.buyer).map(o => ({
                id: `order-${o.id}`,
                type: 'new_order',
                text: `Новый заказ от ${o.buyer.name} на ${o.total.toFixed(2)} USDT`,
                timestamp: o.createdAt.getTime()
            })),
            ...recentUsers.map(u => ({
                id: `user-${u.id}`,
                type: 'new_user',
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
        const recentSellerOrders = await this.orderRepository.find({
            where: {
                createdAt: (0, typeorm_2.MoreThan)(thirtyDaysAgo),
                status: (0, typeorm_2.In)(['COMPLETED', 'DELIVERED', 'SHIPPED'])
            },
            relations: ['seller']
        });
        const sellerStats = new Map();
        recentSellerOrders.forEach(order => {
            if (!order.seller)
                return;
            const sellerId = order.seller.id;
            if (!sellerStats.has(sellerId)) {
                sellerStats.set(sellerId, {
                    seller: order.seller,
                    totalRevenue: 0,
                    salesCount: 0
                });
            }
            const stats = sellerStats.get(sellerId);
            stats.totalRevenue += order.total;
            stats.salesCount += 1;
        });
        const topSellers = Array.from(sellerStats.values())
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5)
            .map(stat => ({
            id: stat.seller.id,
            name: stat.seller.name,
            avatarUrl: stat.seller.avatarUrl,
            totalRevenue: stat.totalRevenue,
            salesCount: stat.salesCount
        }));
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
            topSellers: topSellers,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(dispute_entity_1.Dispute)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map