import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
export interface AdminTransaction {
    id: string;
    date: string;
    type: 'Sale' | 'Withdrawal' | 'Deposit' | 'Commission' | 'Refund' | 'Escrow Hold';
    from: {
        name: string;
    };
    to: {
        name: string;
    };
    amount: number;
    status: 'Completed' | 'Pending' | 'Failed';
}
export declare class TransactionsService {
    private readonly orderRepository;
    private readonly userRepository;
    constructor(orderRepository: Repository<Order>, userRepository: Repository<User>);
    findAll(): Promise<AdminTransaction[]>;
}
