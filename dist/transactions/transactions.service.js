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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../orders/entities/order.entity");
const user_entity_1 = require("../users/entities/user.entity");
let TransactionsService = class TransactionsService {
    constructor(orderRepository, userRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }
    async findAll() {
        const orders = await this.orderRepository.find({
            relations: ['buyer', 'seller', 'escrow'],
            order: { createdAt: 'DESC' },
        });
        const platformUser = { name: 'Platform Treasury' };
        const transactions = [];
        for (const order of orders) {
            if (order.paymentMethod === 'ESCROW') {
                transactions.push({
                    id: `ESCROW-${order.id}`,
                    date: new Date(order.createdAt).toLocaleDateString(),
                    type: order.checkoutMode === 'DEPOSIT' ? 'Deposit' : 'Escrow Hold',
                    from: { name: order.buyer?.name ?? 'Buyer' },
                    to: { name: 'Platform Treasury' },
                    amount: order.escrow?.amount ?? order.total,
                    status: order.escrow?.status === 'FUNDED' ? 'Completed' : 'Pending',
                });
            }
            if (order.status === 'COMPLETED' || order.status === 'DELIVERED') {
                transactions.push({
                    id: `SALE-${order.id}`,
                    date: new Date(order.createdAt).toLocaleDateString(),
                    type: 'Sale',
                    from: { name: order.buyer.name },
                    to: { name: order.seller.name },
                    amount: order.total,
                    status: 'Completed',
                });
                transactions.push({
                    id: `COMM-${order.id}`,
                    date: new Date(order.createdAt).toLocaleDateString(),
                    type: 'Commission',
                    from: { name: order.seller.name },
                    to: platformUser,
                    amount: order.total * 0.02,
                    status: 'Completed',
                });
            }
        }
        transactions.push({
            id: 'WTH-12345',
            date: new Date().toLocaleDateString(),
            type: 'Withdrawal',
            from: { name: 'Pottery Master' },
            to: { name: 'External Wallet' },
            amount: 500.00,
            status: 'Completed'
        });
        return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map