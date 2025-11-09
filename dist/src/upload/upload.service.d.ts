import 'multer';
export declare class UploadService {
    private readonly allowedImageMimeTypes;
    private readonly maxImageSizeBytes;
    private readonly maxVideoSizeBytes;
    private readonly maxImageDimension;
    uploadFile(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    uploadFileFromUrl(imageUrl: string): Promise<{
        url: string;
    }>;
    private uploadBuffer;
    private prepareBufferForUpload;
    private ensureFileWithinLimit;
    private optimizeImage;
}
