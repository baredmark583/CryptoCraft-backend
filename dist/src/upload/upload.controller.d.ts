import 'multer';
import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadFile(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    uploadFileFromUrl(imageUrl: string): Promise<{
        url: string;
    }>;
}
