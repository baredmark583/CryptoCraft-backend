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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const user_entity_1 = require("../users/entities/user.entity");
const product_entity_1 = require("../products/entities/product.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const telegram_service_1 = require("../telegram/telegram.service");
const escrow_service_1 = require("../escrow/escrow.service");
let OrdersService = class OrdersService {
    constructor(dataSource, orderRepository, userRepository, telegramService, escrowService) {
        this.dataSource = dataSource;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.telegramService = telegramService;
        this.escrowService = escrowService;
    }
    async create(createOrderDto, buyerId) {
        const { cartItems, shippingAddress, shippingMethod, paymentMethod, transactionHash, checkoutMode = 'CART', escrowDepositAmount, meetingDetails, } = createOrderDto;
        if (checkoutMode === 'DEPOSIT' && paymentMethod !== 'ESCROW') {
            throw new common_1.BadRequestException('Deposit checkout mode доступен только для escrow-платежей.');
        }
        if (checkoutMode === 'DEPOSIT' && (!escrowDepositAmount || escrowDepositAmount <= 0)) {
            throw new common_1.BadRequestException('Deposit amount is required for deposit checkout mode.');
        }
        if (checkoutMode === 'DEPOSIT' && !meetingDetails) {
            throw new common_1.BadRequestException('Meeting details are required for deposit checkout mode.');
        }
        const itemsBySeller = new Map();
        for (const item of cartItems) {
            const sellerId = item.product.seller.id;
            if (!itemsBySeller.has(sellerId)) {
                itemsBySeller.set(sellerId, []);
            }
            itemsBySeller.get(sellerId).push(item);
        }
        const createdOrders = [];
        await this.dataSource.transaction(async (manager) => {
            const buyer = await manager.findOneBy(user_entity_1.User, { id: buyerId });
            if (!buyer) {
                throw new common_1.NotFoundException('Buyer not found');
            }
            for (const [sellerId, items] of itemsBySeller.entries()) {
                const seller = await manager.findOneBy(user_entity_1.User, { id: sellerId });
                if (!seller) {
                    throw new common_1.NotFoundException(`Seller with id ${sellerId} not found`);
                }
                const productIds = items.map(item => item.product.id);
                const products = await manager.findBy(product_entity_1.Product, { id: (0, typeorm_2.In)(productIds) });
                const productMap = new Map(products.map(p => [p.id, p]));
                for (const item of items) {
                    const product = productMap.get(item.product.id);
                    if (!product)
                        throw new common_1.NotFoundException(`Product with ID ${item.product.id} not found.`);
                    if (item.variant) {
                        const variant = product.variants?.find(v => v.id === item.variant.id);
                        if (!variant)
                            throw new common_1.NotFoundException(`Variant with ID ${item.variant.id} not found for product ${product.title}.`);
                        if (variant.stock < item.quantity) {
                            throw new common_1.BadRequestException(`Not enough stock for "${product.title} - ${Object.values(variant.attributes).join(', ')}". Available: ${variant.stock}`);
                        }
                    }
                    else {
                        if (product.stock < item.quantity) {
                            throw new common_1.BadRequestException(`Not enough stock for "${product.title}". Available: ${product.stock}`);
                        }
                    }
                }
                const baseOrder = {
                    buyer,
                    seller,
                    shippingAddress: checkoutMode === 'DEPOSIT' ? null : shippingAddress,
                    shippingMethod: checkoutMode === 'DEPOSIT' ? 'MEETUP' : shippingMethod,
                    paymentMethod,
                    transactionHash,
                    orderDate: Date.now(),
                    items: [],
                    total: 0,
                    checkoutMode,
                    meetingDetails: checkoutMode === 'DEPOSIT' ? meetingDetails : null,
                    depositAmount: checkoutMode === 'DEPOSIT' ? escrowDepositAmount : null,
                };
                const newOrder = manager.create(order_entity_1.Order, baseOrder);
                let total = 0;
                for (const item of items) {
                    const product = productMap.get(item.product.id);
                    if (!product) {
                        throw new common_1.BadRequestException(`Product with ID ${item.product.id} was not found during order creation.`);
                    }
                    const orderItem = manager.create(order_item_entity_1.OrderItem, {
                        product,
                        quantity: item.quantity,
                        price: item.priceAtTimeOfAddition,
                        variant: item.variant,
                        purchaseType: item.purchaseType,
                        order: newOrder,
                    });
                    if (!newOrder.items)
                        newOrder.items = [];
                    newOrder.items.push(orderItem);
                    total += item.priceAtTimeOfAddition * item.quantity;
                    if (item.variant) {
                        const variantIndex = product.variants?.findIndex(v => v.id === item.variant.id);
                        if (variantIndex !== -1 && product.variants) {
                            product.variants[variantIndex].stock -= item.quantity;
                        }
                    }
                    else {
                        product.stock -= item.quantity;
                    }
                    await manager.save(product_entity_1.Product, product);
                }
                newOrder.total = total;
                if (paymentMethod === 'DIRECT') {
                    newOrder.status = 'PAID';
                }
                const savedOrder = await manager.save(order_entity_1.Order, newOrder);
                createdOrders.push(savedOrder);
            }
        });
        for (const savedOrder of createdOrders) {
            try {
                if (savedOrder.seller && savedOrder.buyer) {
                    await this.telegramService.sendNewOrderNotification(savedOrder.seller, savedOrder.buyer, savedOrder.id, savedOrder.total);
                }
            }
            catch (e) {
                console.error(`Failed to send Telegram notification for order ${savedOrder.id}`, e);
            }
            if (savedOrder.paymentMethod === 'ESCROW') {
                await this.escrowService.createForOrder(savedOrder, {
                    escrowType: savedOrder.checkoutMode === 'DEPOSIT' ? 'DEPOSIT' : 'CART',
                });
            }
        }
        return { success: true };
    }
    findAll() {
        return this.orderRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['buyer', 'seller', 'items', 'items.product']
        });
    }
    findPurchases(userId) {
        return this.orderRepository.find({
            where: { buyer: { id: userId } },
            order: { createdAt: 'DESC' },
        });
    }
    findSales(userId) {
        return this.orderRepository.find({
            where: { seller: { id: userId } },
            order: { createdAt: 'DESC' },
        });
    }
    async update(id, updateOrderDto) {
        const order = await this.orderRepository.preload({
            id,
            ...updateOrderDto,
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID "${id}" not found`);
        }
        return this.orderRepository.save(order);
    }
    async generateWaybill(id) {
        const order = await this.orderRepository.findOneBy({ id });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID "${id}" not found`);
        }
        order.status = 'SHIPPED';
        order.trackingNumber = `59000${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        return this.orderRepository.save(order);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository,
        telegram_service_1.TelegramService,
        escrow_service_1.EscrowService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map