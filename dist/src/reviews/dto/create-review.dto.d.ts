declare class ReviewAttachmentDto {
    type: 'image' | 'video';
    url: string;
    thumbnailUrl?: string;
    name?: string;
    mimeType?: string;
    size?: number;
}
export declare class CreateReviewDto {
    productId: string;
    orderId: string;
    rating: number;
    text?: string;
    attachments?: ReviewAttachmentDto[];
    imageUrl?: string;
}
export {};
