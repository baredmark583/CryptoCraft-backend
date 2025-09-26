import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { OrderItem } from './entities/order-item.entity';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createOrderDto: CreateOrderDto, buyerId: string): Promise<{ success: boolean }> {
    const { cartItems, shippingAddress, shippingMethod, paymentMethod, transactionHash } = createOrderDto;

    // Group items by seller
    const itemsBySeller = new Map<string, typeof cartItems>();
    for (const item of cartItems) {
      const sellerId = item.product.seller.id;
      if (!itemsBySeller.has(sellerId)) {
        itemsBySeller.set(sellerId, []);
      }
      itemsBySeller.get(sellerId).push(item);
    }

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
        const products = await manager.findBy(Product, { id: In(productIds) });
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
        const newOrder = manager.create(Order, {
          buyer,
          seller,
          shippingAddress,
          shippingMethod,
          paymentMethod,
          transactionHash,
          orderDate: Date.now(),
          items: [],
          total: 0,
        });

        let total = 0;
        for (const item of items) {
            const product = productMap.get(item.product.id);
            
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
            
            // Decrement stock
            if (item.variant) {
                const variantIndex = product.variants.findIndex(v => v.id === item.variant.id);
                if (variantIndex !== -1) {
                    product.variants[variantIndex].stock -= item.quantity;
                }
            } else {
                product.stock -= item.quantity;
            }
            await manager.save(Product, product);
        }
        
        newOrder.total = total;
        await manager.save(Order, newOrder);
      }
    });
    
    return { success: true };
  }
  
  findAll(): Promise<Order[]> {
    return this.orderRepository.find({
        order: { createdAt: 'DESC' },
        relations: ['buyer', 'seller', 'items', 'items.product'] // Ensure all relations are loaded
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