declare class ProductContextDto {
    id: string;
}
declare class AttachmentDto {
    id: string;
    type: 'image' | 'file';
    url: string;
    name?: string;
    mimeType?: string;
    size?: number;
    width?: number;
    height?: number;
    thumbnailUrl?: string;
}
export declare class CreateMessageDto {
    text?: string;
    imageUrl?: string;
    productContext?: ProductContextDto;
    attachments?: AttachmentDto[];
    quickReplies?: string[];
}
export {};
