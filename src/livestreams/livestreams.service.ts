import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Livestream } from './entities/livestream.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { CreateLivestreamDto } from './dto/create-livestream.dto';

@Injectable()
export class LivestreamsService {
  constructor(
    @InjectRepository(Livestream)
    private readonly livestreamRepository: Repository<Livestream>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(sellerId: string, createDto: CreateLivestreamDto): Promise<Livestream> {
    const seller = await this.userRepository.findOneBy({ id: sellerId });
    if (!seller) throw new NotFoundException('Seller not found');

    const featuredProduct = await this.productRepository.findOneBy({ id: createDto.featuredProductId });
    if (!featuredProduct) throw new NotFoundException('Featured product not found');

    const livestream = this.livestreamRepository.create({
      ...createDto,
      seller,
      featuredProduct,
      status: createDto.scheduledStartTime ? 'UPCOMING' : 'LIVE',
    });

    return this.livestreamRepository.save(livestream);
  }

  findAll(): Promise<Livestream[]> {
    return this.livestreamRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['seller', 'featuredProduct'],
    });
  }

  async findOne(id: string): Promise<Livestream> {
    const livestream = await this.livestreamRepository.findOne({
      where: { id },
      relations: ['seller', 'featuredProduct'],
    });
    if (!livestream) {
      throw new NotFoundException(`Livestream with ID "${id}" not found`);
    }
    return livestream;
  }
}
