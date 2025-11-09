import { ValueTransformer } from 'typeorm';
export declare class DecimalTransformer implements ValueTransformer {
    to(data: number | null): number | null;
    from(data: string | null): number | null;
}
export declare abstract class BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
