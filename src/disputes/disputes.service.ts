import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute } from './entities/dispute.entity';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { Order } from 'src/orders/entities/order.entity';

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll(): Promise<Dispute[]> {
    return this.disputeRepository.find({
      relations: ['order', 'order.buyer', 'order.seller', 'order.items', 'order.items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Dispute> {
    const dispute = await this.disputeRepository.findOne({
      where: { id },
      relations: ['order', 'order.buyer', 'order.seller', 'order.items', 'order.items.product'],
    });
    if (!dispute) {
      throw new NotFoundException(`Dispute with ID ${id} not found`);
    }
    return dispute;
  }

  async update(id: string, updateDisputeDto: UpdateDisputeDto): Promise<Dispute> {
    const dispute = await this.disputeRepository.preload({
      id,
      ...updateDisputeDto,
    });
    if (!dispute) {
      throw new NotFoundException(`Dispute with ID ${id} not found`);
    }
    const savedDispute = await this.disputeRepository.save(dispute);
    
    // После сохранения перезагружаем сущность со всеми связями для полного ответа
    return this.findOne(savedDispute.id);
  }
}
