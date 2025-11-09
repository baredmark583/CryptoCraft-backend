import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Review,
  ReviewBehaviorSignal,
  ReviewMediaAttachment,
} from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Order } from '../orders/entities/order.entity';

const REVIEWABLE_STATUSES = new Set(['DELIVERED', 'COMPLETED']);
const PRO_ACTIVITY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const RISK_AUTO_HIDE_THRESHOLD = 60;
const TOXIC_WORDS = [
  'идиот',
  'лох',
  'сука',
  'тварь',
  'мразь',
  'shit',
  'fuck',
  'bitch',
];

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(authorId: string, createDto: CreateReviewDto): Promise<Review> {
    const [author, product, order] = await Promise.all([
      this.userRepository.findOneBy({ id: authorId }),
      this.productRepository.findOne({
        where: { id: createDto.productId },
        relations: ['seller'],
      }),
      this.orderRepository.findOne({
        where: { id: createDto.orderId },
        relations: ['buyer', 'items', 'items.product'],
      }),
    ]);

    if (!author) {
      throw new NotFoundException('Author not found');
    }
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!order.buyer || order.buyer.id !== authorId) {
      throw new ForbiddenException('Only the buyer can leave a review for this order');
    }

    if (!REVIEWABLE_STATUSES.has(order.status)) {
      throw new ForbiddenException('Reviews are available only after delivery confirmation');
    }

    const orderItem = order.items.find((item) => item.product.id === product.id);
    if (!orderItem) {
      throw new ForbiddenException('You did not purchase this product in the referenced order');
    }

    const existingReview = await this.reviewRepository.findOne({
      where: { sourceOrderId: order.id, product: { id: product.id } },
    });
    if (existingReview) {
      throw new ConflictException('This order already has a review for the selected product');
    }

    const attachments = this.normalizeAttachments(createDto.attachments, createDto.imageUrl);
    const guardrails = await this.evaluateReviewGuardrails(
      authorId,
      order,
      createDto,
      attachments,
    );

    const review = this.reviewRepository.create({
      product,
      author,
      rating: createDto.rating,
      text: createDto.text?.trim() || '',
      attachments,
      imageUrl: attachments[0]?.type === 'image' ? attachments[0].url : createDto.imageUrl,
      sourceOrderId: order.id,
      sourceOrderItemId: orderItem.id,
      verifiedDeliveryAt: order.updatedAt ?? new Date(),
      behaviorSignals: guardrails.signals,
      fraudScore: guardrails.score,
      isHidden: guardrails.shouldHide,
      moderationFlags: guardrails.flags,
    });

    const savedReview = await this.reviewRepository.save(review);
    await this.updateSellerRating(product.seller.id);

    return savedReview;
  }

  async findByProductId(productId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { product: { id: productId }, isHidden: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findByAuthorId(authorId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { author: { id: authorId } },
      order: { createdAt: 'DESC' },
    });
  }

  private normalizeAttachments(
    attachments?: CreateReviewDto['attachments'],
    legacyImageUrl?: string,
  ): ReviewMediaAttachment[] {
    if (attachments?.length) {
      return attachments.map((attachment) => ({
        ...attachment,
        name: attachment.name?.slice(0, 120),
      }));
    }
    if (legacyImageUrl) {
      return [
        {
          type: 'image',
          url: legacyImageUrl,
        },
      ];
    }
    return [];
  }

  private async evaluateReviewGuardrails(
    authorId: string,
    order: Order,
    payload: CreateReviewDto,
    attachments: ReviewMediaAttachment[],
  ): Promise<{
    signals: ReviewBehaviorSignal[];
    score: number;
    flags: string[];
    shouldHide: boolean;
  }> {
    const signals: ReviewBehaviorSignal[] = [];
    const flags: string[] = [];
    let score = 0;
    const nowIso = new Date().toISOString();

    const pushSignal = (code: string, weight: number, detail?: string) => {
      signals.push({ code, weight, detail, triggeredAt: nowIso });
      score += weight;
    };

    const textLength = payload.text?.trim().length ?? 0;
    if (textLength > 0 && textLength < 25) {
      pushSignal('SHORT_TEXT', 10, 'Комментарий короче 25 символов');
    }

    if (!attachments.length && payload.rating >= 4) {
      pushSignal('NO_MEDIA_EUPHORIA', 5, 'Высокая оценка без медиа-доказательств');
    }

    if (payload.rating === 5 && textLength < 12) {
      pushSignal('SKIMPY_FIVE_STAR', 15, 'Очень короткий восторженный отзыв');
    }

    if (payload.rating === 1 && textLength < 20) {
      pushSignal('SKIMPY_ONE_STAR', 15, 'Жалоба без подробностей');
    }

    const duplicate = payload.text
      ? await this.reviewRepository.findOne({
          where: {
            author: { id: authorId },
            text: payload.text.trim(),
          },
        })
      : null;
    if (duplicate) {
      pushSignal('DUPLICATE_TEXT', 25, 'Найден идентичный текст в предыдущих отзывах');
    }

    const burstWindow = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentReviews = await this.reviewRepository
      .createQueryBuilder('review')
      .where('review.authorId = :authorId', { authorId })
      .andWhere('review.createdAt >= :burstWindow', { burstWindow })
      .getCount();
    if (recentReviews >= 3) {
      pushSignal('BURST_ACTIVITY', 25, 'Более 3 отзывов за последние 24 часа');
    }

    const toxicReasons = this.detectToxicPhrases(payload.text);
    if (toxicReasons.length) {
      flags.push(`TOXIC:${toxicReasons.join(',')}`);
    }

    const deliveryDelay = order.updatedAt
      ? Date.now() - order.updatedAt.getTime()
      : Number.MAX_SAFE_INTEGER;
    if (deliveryDelay < 2 * 60 * 60 * 1000) {
      pushSignal('TOO_FAST_AFTER_DELIVERY', 10, 'Отзыв оставлен меньше чем через 2 часа после подтверждения');
    }

    const shouldHide = flags.length > 0 || score >= RISK_AUTO_HIDE_THRESHOLD;
    return { signals, score, flags, shouldHide };
  }

  private detectToxicPhrases(text?: string): string[] {
    if (!text) {
      return [];
    }
    const lowered = text.toLowerCase();
    return TOXIC_WORDS.filter((word) => lowered.includes(word));
  }

  private async updateSellerRating(sellerId: string) {
    const seller = await this.userRepository.findOne({ where: { id: sellerId } });
    if (!seller) {
      return;
    }

    const stats = await this.reviewRepository
      .createQueryBuilder('review')
      .innerJoin('review.product', 'product')
      .where('product.sellerId = :sellerId', { sellerId })
      .select('COUNT(review.id)', 'total')
      .addSelect('AVG(review.rating)', 'avgRating')
      .addSelect("COUNT(CASE WHEN review.rating = 5 THEN 1 END)", 'fiveStar')
      .addSelect('MAX(review.createdAt)', 'lastReviewAt')
      .getRawOne<{
        total: string;
        avgRating: string;
        fiveStar: string;
        lastReviewAt: string | null;
      }>();

    const totalReviews = Number(stats?.total ?? 0);
    const avgRating = stats?.avgRating ? Number(stats.avgRating) : 0;

    seller.rating = totalReviews ? Number(avgRating.toFixed(2)) : 0;

    await this.refreshSellerProStatus(seller, {
      fiveStar: Number(stats?.fiveStar ?? 0),
      lastReviewAt: stats?.lastReviewAt ? new Date(stats.lastReviewAt) : null,
    });

    await this.userRepository.save(seller);
  }

  private async refreshSellerProStatus(
    seller: User,
    stats: { fiveStar: number; lastReviewAt: Date | null },
  ) {
    const meetsPositiveThreshold = stats.fiveStar >= 20;
    const isActiveRecently = stats.lastReviewAt
      ? Date.now() - stats.lastReviewAt.getTime() <= PRO_ACTIVITY_WINDOW_MS
      : false;

    if (meetsPositiveThreshold && isActiveRecently) {
      if (seller.verificationLevel !== 'PRO') {
        seller.verificationLevel = 'PRO';
        seller.proGrantedAt = new Date();
      }
      seller.lastProReviewAt = stats.lastReviewAt ?? new Date();
      return;
    }

    if (seller.verificationLevel === 'PRO') {
      seller.verificationLevel = 'NONE';
    }
  }
}
