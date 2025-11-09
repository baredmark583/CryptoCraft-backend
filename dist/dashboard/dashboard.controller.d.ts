import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
