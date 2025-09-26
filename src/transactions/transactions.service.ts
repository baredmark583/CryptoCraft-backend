import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';

// This is a simplified transaction structure for the admin panel
export interface AdminTransaction {
    id: string;
    date: string;
    type: 'Sale' | 'Withdrawal' | 'Deposit' | 'Commission' | 'Refund';
    from: { name: string };
    to: { name: string };
    amount: number;
    status: 'Completed' | 'Pending' | 'Failed';
}

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findAll(): Promise<AdminTransaction[]> {
        const orders = await this.orderRepository.find({
            relations: ['buyer', 'seller'],
            order: { createdAt: 'DESC' },
        });

        const platformUser = { name: 'Platform Treasury' };
        const transactions: AdminTransaction[] = [];

        for (const order of orders) {
            if (order.status === 'COMPLETED' || order.status === 'DELIVERED') {
                // Sale transaction from buyer to seller
                transactions.push({
                    id: `SALE-${order.id}`,
                    date: new Date(order.createdAt).toLocaleDateString(),
                    type: 'Sale',
                    from: { name: order.buyer.name },
                    to: { name: order.seller.name },
                    amount: order.total,
                    status: 'Completed',
                });

                // Commission transaction from seller to platform
                transactions.push({
                    id: `COMM-${order.id}`,
                    date: new Date(order.createdAt).toLocaleDateString(),
                    type: 'Commission',
                    from: { name: order.seller.name },
                    to: platformUser,
                    amount: order.total * 0.02, // Assuming 2% commission
                    status: 'Completed',
                });
            }
        }

        // In a real app, you would also query withdrawal and deposit entities
        // For now, we add some mock data for demonstration
        transactions.push({
            id: 'WTH-12345',
            date: new Date().toLocaleDateString(),
            type: 'Withdrawal',
            from: { name: 'Pottery Master' },
            to: { name: 'External Wallet' },
            amount: 500.00,
            status: 'Completed'
        });

        return transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
}
