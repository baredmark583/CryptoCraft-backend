import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(req: any, createReviewDto: CreateReviewDto): Promise<import("./entities/review.entity").Review>;
    getReviewsForProduct(productId: string): Promise<import("./entities/review.entity").Review[]>;
    getReviewsByAuthor(userId: string): Promise<import("./entities/review.entity").Review[]>;
}
