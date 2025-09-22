import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { sellerId, ...productData } = createProductDto;
    const seller = await this.usersRepository.findOneBy({ id: sellerId });
    if (!seller) {
      throw new NotFoundException(`Seller with ID "${sellerId}" not found`);
    }

    const product = this.productsRepository.create({
      ...productData,
      seller,
    });

    return this.productsRepository.save(product);
  }

  findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productsRepository.preload({
      id,
      ...updateProductDto,
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    await this.productsRepository.save(product);
    // After saving, reload the entity with its relations to ensure the response is complete.
    // This fixes the bug where eager relations (like 'seller') were missing in the response.
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
  }
}