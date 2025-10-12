import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Livestream } from './entities/livestream.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { CreateLivestreamDto } from './dto/create-livestream.dto';
import { ConfigService } from '@nestjs/config';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LivestreamsService {
  constructor(
    @InjectRepository(Livestream)
    private readonly livestreamRepository: Repository<Livestream>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly configService: ConfigService,
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

  async generateJoinToken(streamId: string, user: { userId: string, username: string } | null): Promise<string> {
    const stream = await this.livestreamRepository.findOne({
      where: { id: streamId },
      relations: ['seller'],
    });

    if (!stream) {
      throw new NotFoundException(`Livestream with ID "${streamId}" not found`);
    }

    const isSeller = user ? stream.seller.id === user.userId : false;
    const identity = user ? user.userId : `guest-${Date.now()}`;
    const name = user ? user.username : `Guest#${Math.floor(Math.random() * 1000)}`;

    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');
    const roomName = stream.id;

    if (!apiKey || !apiSecret) {
      throw new Error('LiveKit API key or secret is not configured.');
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: identity,
      name: name,
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: isSeller,
      canPublishData: true,
      canSubscribe: true,
    });
    
    return at.toJwt();
  }

  async endStream(id: string, userId: string, userRole: UserRole): Promise<Livestream> {
    const livestream = await this.findOne(id);
    const isSeller = livestream.seller.id === userId;
    const isModerator = userRole === UserRole.SUPER_ADMIN || userRole === UserRole.MODERATOR;

    if (!isSeller && !isModerator) {
      throw new ForbiddenException('You do not have permission to end this stream.');
    }

    livestream.status = 'ENDED';
    return this.livestreamRepository.save(livestream);
  }
}