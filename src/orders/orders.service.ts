import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { OrderItem } from './entities/order-item.entity';
import { UpdateOrderDto } from './dto/update-order.dto';
import { TelegramService } from '../telegram/telegram.service';
import { EscrowService } from '../escrow/escrow.service';

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly telegramService: TelegramService,
    private readonly escrowService: EscrowService,
  ) {}

  async create(createOrderDto: CreateOrderDto, buyerId: string): Promise<{ success: boolean }> {
    const {
      cartItems,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      transactionHash,
      checkoutMode = 'CART',
      escrowDepositAmount,
      meetingDetails,
    } = createOrderDto;

    if (checkoutMode === 'DEPOSIT' && paymentMethod !== 'ESCROW') {
      throw new BadRequestException('Deposit checkout mode доступен только для escrow-платежей.');
    }

    if (checkoutMode === 'DEPOSIT' && (!escrowDepositAmount || escrowDepositAmount <= 0)) {
      throw new BadRequestException('Deposit amount is required for deposit checkout mode.');
    }

    if (checkoutMode === 'DEPOSIT' && !meetingDetails) {
      throw new BadRequestException('Meeting details are required for deposit checkout mode.');
    }

    // Group items by seller
    const itemsBySeller = new Map<string, typeof cartItems>();
    for (const item of cartItems) {
      const sellerId = item.product.seller.id;
      if (!itemsBySeller.has(sellerId)) {
        itemsBySeller.set(sellerId, []);
      }
      itemsBySeller.get(sellerId).push(item);
    }

    const createdOrders: Order[] = [];

    await this.dataSource.transaction(async (manager) => {
      const buyer = await manager.findOneBy(User, { id: buyerId });
      if (!buyer) {
        throw new NotFoundException('Buyer not found');
      }

      for (const [sellerId, items] of itemsBySeller.entries()) {
        const seller = await manager.findOneBy(User, { id: sellerId });
        if (!seller) {
          throw new NotFoundException(`Seller with id ${sellerId} not found`);
        }
        
        const productIds = items.map(item => item.product.id);
        const products: Product[] = await manager.findBy(Product, { id: In(productIds) });
        const productMap = new Map(products.map(p => [p.id, p]));

        // 1. Validate stock first
        for (const item of items) {
            const product = productMap.get(item.product.id);
            if (!product) throw new NotFoundException(`Product with ID ${item.product.id} not found.`);
            
            if (item.variant) {
                const variant = product.variants?.find(v => v.id === item.variant.id);
                if (!variant) throw new NotFoundException(`Variant with ID ${item.variant.id} not found for product ${product.title}.`);
                if (variant.stock < item.quantity) {
                    throw new BadRequestException(`Not enough stock for "${product.title} - ${Object.values(variant.attributes).join(', ')}". Available: ${variant.stock}`);
                }
            } else {
                if (product.stock < item.quantity) {
                     throw new BadRequestException(`Not enough stock for "${product.title}". Available: ${product.stock}`);
                }
            }
        }

        // 2. Create order and decrement stock
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

        const newOrder = manager.create(Order, baseOrder);

        let total = 0;
        for (const item of items) {
            const product = productMap.get(item.product.id);
            if (!product) {
              throw new BadRequestException(`Product with ID ${item.product.id} was not found during order creation.`);
            }
            
            const orderItem = manager.create(OrderItem, {
              product,
              quantity: item.quantity,
              price: item.priceAtTimeOfAddition,
              variant: item.variant,
              purchaseType: item.purchaseType,
              order: newOrder,
            });
            
            if (!newOrder.items) newOrder.items = [];
            newOrder.items.push(orderItem);
            
            total += item.priceAtTimeOfAddition * item.quantity;
            
            if (item.variant) {
                const variantIndex = product.variants?.findIndex(v => v.id === item.variant.id);
                if (variantIndex !== -1 && product.variants) {
                    product.variants[variantIndex].stock -= item.quantity;
                }
            } else {
                product.stock -= item.quantity;
            }
            await manager.save(Product, product);
        }
        
        newOrder.total = total;
        if (paymentMethod === 'DIRECT') {
            newOrder.status = 'PAID';
        }
        const savedOrder = await manager.save(Order, newOrder);
        createdOrders.push(savedOrder);
      } // end sellers loop
    });
    
    for (const savedOrder of createdOrders) {
        try {
            if (savedOrder.seller && savedOrder.buyer) {
                await this.telegramService.sendNewOrderNotification(savedOrder.seller, savedOrder.buyer, savedOrder.id, savedOrder.total);
            }
        } catch (e) {
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
  
  findAll(): Promise<Order[]> {
    return this.orderRepository.find({
        order: { createdAt: 'DESC' },
        relations: ['buyer', 'seller', 'items', 'items.product']
    });
  }

  findPurchases(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { buyer: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  findSales(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { seller: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.preload({
      id,
      ...updateOrderDto,
    });
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
    return this.orderRepository.save(order);
  }

  async generateWaybill(id: string): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
    order.status = 'SHIPPED';
    order.trackingNumber = `59000${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    return this.orderRepository.save(order);
  }
}
