import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { PromoCode } from '../promocodes/entities/promocode.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update({ user: { id: userId }, read: false }, { read: true });
  }

  async createPersonalOffer(senderId: string, recipientId: string, product: Product, promoCode: PromoCode): Promise<Notification> {
    const sender = await this.userRepository.findOneBy({ id: senderId });
    const recipient = await this.userRepository.findOneBy({ id: recipientId });
    if (!sender || !recipient) throw new NotFoundException('User not found');

    const discountText = promoCode.discountType === 'PERCENTAGE' ? `${promoCode.discountValue}%` : `${promoCode.discountValue} USDT`;

    const notification = this.notificationRepository.create({
      user: recipient,
      type: 'personal_offer',
      text: `${sender.name} sent you a personal offer of ${discountText} off for "${product.title}"!`,
      link: `/product/${product.id}`,
    });

    return this.notificationRepository.save(notification);
  }
}