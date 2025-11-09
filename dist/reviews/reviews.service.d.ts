import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Order } from '../orders/entities/order.entity';
export declare class ReviewsService {
    private readonly reviewRepository;
    private readonly userRepository;
    private readonly productRepository;
    private readonly orderRepository;
    constructor(reviewRepository: Repository<Review>, userRepository: Repository<User>, productRepository: Repository<Product>, orderRepository: Repository<Order>);
    create(authorId: string, createDto: CreateReviewDto): Promise<Review>;
    findByProductId(productId: string): Promise<Review[]>;
    findByAuthorId(authorId: string): Promise<Review[]>;
    private normalizeAttachments;
    private evaluateReviewGuardrails;
    private detectToxicPhrases;
    private updateSellerRating;
    private refreshSellerProStatus;
}
