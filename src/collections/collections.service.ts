import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from './entities/collection.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(userId: string, createDto: CreateCollectionDto): Promise<Collection> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    const collection = this.collectionRepository.create({ ...createDto, user, products: [] });
    return this.collectionRepository.save(collection);
  }

  async findByUserId(userId: string): Promise<Collection[]> {
    const collections = await this.collectionRepository.find({ 
      where: { user: { id: userId } }, 
      order: { createdAt: 'DESC' },
      relations: ['products'] // Eagerly load products to get productIds count
    });
    // Map to the format expected by the frontend
    return collections.map(c => ({...c, productIds: c.products.map(p => p.id)}));
  }

  async findOne(collectionId: string, userId: string): Promise<{ collection: Collection, products: Product[] }> {
    const collection = await this.collectionRepository.findOne({ where: { id: collectionId }, relations: ['user', 'products'] });
    if (!collection) throw new NotFoundException('Collection not found');
    if (collection.user.id !== userId) throw new ForbiddenException('Access denied');
    // Map to frontend format
    const collectionWithProductIds = {...collection, productIds: collection.products.map(p => p.id)};
    return { collection: collectionWithProductIds, products: collection.products };
  }

  async addProduct(collectionId: string, productId: string, userId: string): Promise<void> {
    const { collection } = await this.findOne(collectionId, userId);
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) throw new NotFoundException('Product not found');
    
    const isProductInCollection = collection.products.some(p => p.id === productId);
    if (!isProductInCollection) {
        collection.products.push(product);
        await this.collectionRepository.save(collection);
    }
  }

  async removeProduct(collectionId: string, productId: string, userId: string): Promise<void> {
    const { collection } = await this.findOne(collectionId, userId);
    collection.products = collection.products.filter(p => p.id !== productId);
    await this.collectionRepository.save(collection);
  }
}