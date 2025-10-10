import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(authorId: string, createDto: CreateReviewDto): Promise<Review> {
    const author = await this.userRepository.findOneBy({ id: authorId });
    if (!author) throw new NotFoundException('Author not found');

    const product = await this.productRepository.findOneBy({ id: createDto.productId });
    if (!product) throw new NotFoundException('Product not found');

    const review = this.reviewRepository.create({
      ...createDto,
      author,
      product,
    });

    const savedReview = await this.reviewRepository.save(review);
    
    // After saving, update the seller's rating
    await this.updateSellerRating(product.seller.id);
    
    return savedReview;
  }

  async findByProductId(productId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { product: { id: productId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findByAuthorId(authorId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { author: { id: authorId } },
      order: { createdAt: 'DESC' },
    });
  }
  
  private async updateSellerRating(sellerId: string) {
    const sellerWithReviews = await this.userRepository.findOne({
        where: { id: sellerId },
        relations: ['products', 'products.reviews']
    });

    if (!sellerWithReviews) return;

    const allReviews = sellerWithReviews.products.flatMap(p => p.reviews);
    
    if (allReviews.length === 0) {
        sellerWithReviews.rating = 0;
    } else {
        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
        sellerWithReviews.rating = totalRating / allReviews.length;
    }

    await this.userRepository.save(sellerWithReviews);
  }
}