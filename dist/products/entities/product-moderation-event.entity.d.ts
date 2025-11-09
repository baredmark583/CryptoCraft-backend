import { BaseEntity } from '../../database/base.entity';
import { Product } from './product.entity';
import { User } from '../../users/entities/user.entity';
import type { ModerationStatus } from './product.entity';
export type ModerationAction = 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'APPEALED' | 'REOPENED';
export declare class ProductModerationEvent extends BaseEntity {
    product: Product;
    moderator?: User;
    moderatorId?: string;
    action: ModerationAction;
    comment?: string;
    previousStatus?: ModerationStatus | null;
    nextStatus?: ModerationStatus | null;
}
