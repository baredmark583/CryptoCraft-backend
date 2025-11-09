"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
require("multer");
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
const axios_1 = require("axios");
const buffer_1 = require("buffer");
const sharp_1 = require("sharp");
let UploadService = class UploadService {
    constructor() {
        this.allowedImageMimeTypes = new Set([
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/avif',
            'image/heic',
            'image/heif',
        ]);
        this.maxImageSizeBytes = Number(process.env.UPLOAD_MAX_IMAGE_SIZE_BYTES) || 8 * 1024 * 1024;
        this.maxVideoSizeBytes = Number(process.env.UPLOAD_MAX_VIDEO_SIZE_BYTES) || 60 * 1024 * 1024;
        this.maxImageDimension = Number(process.env.UPLOAD_MAX_IMAGE_DIMENSION) || 1920;
    }
    async uploadFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('Make sure that the file is uploaded');
        }
        const { buffer, resourceType } = await this.prepareBufferForUpload(file.buffer, file.mimetype);
        return this.uploadBuffer(buffer, resourceType);
    }
    async uploadFileFromUrl(imageUrl) {
        if (!imageUrl) {
            throw new common_1.BadRequestException('Image URL is required');
        }
        try {
            const response = await axios_1.default.get(imageUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                },
                timeout: 45000,
            });
            const buffer = buffer_1.Buffer.from(response.data, 'binary');
            const contentType = response.headers['content-type'];
            const { buffer: processed, resourceType } = await this.prepareBufferForUpload(buffer, contentType);
            return this.uploadBuffer(processed, resourceType);
        }
        catch (error) {
            console.error(`Failed to download or upload image from URL: ${imageUrl}`, error);
            throw new common_1.BadRequestException(`Could not process image from URL. It may be invalid or protected.`);
        }
    }
    uploadBuffer(buffer, resourceType = 'auto') {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                resource_type: resourceType,
                folder: 'cryptocraft',
            }, (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve({ url: result.secure_url });
            });
            const readableStream = new stream_1.Readable();
            readableStream._read = () => { };
            readableStream.push(buffer);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
        });
    }
    async prepareBufferForUpload(buffer, mimeType) {
        if (mimeType?.startsWith('video/')) {
            this.ensureFileWithinLimit(buffer, this.maxVideoSizeBytes, 'Видео');
            return { buffer, resourceType: 'video' };
        }
        if (mimeType && !mimeType.startsWith('image/')) {
            throw new common_1.BadRequestException('Поддерживаются только изображения JPG, PNG, WebP, AVIF или HEIC.');
        }
        const optimized = await this.optimizeImage(buffer, mimeType);
        return { buffer: optimized, resourceType: 'image' };
    }
    ensureFileWithinLimit(buffer, limitBytes, label) {
        if (buffer.length > limitBytes) {
            const mb = (limitBytes / (1024 * 1024)).toFixed(1);
            throw new common_1.BadRequestException(`${label} превышает допустимый размер (${mb} МБ).`);
        }
    }
    async optimizeImage(buffer, mimeType) {
        if (mimeType && !this.allowedImageMimeTypes.has(mimeType)) {
            throw new common_1.BadRequestException('Этот формат изображения не поддерживается. Используйте JPG, PNG, WebP, AVIF или HEIC.');
        }
        try {
            const metadata = await (0, sharp_1.default)(buffer, { failOnError: true }).metadata();
            if (!metadata.width || !metadata.height) {
                throw new common_1.BadRequestException('Не удалось определить размер изображения. Попробуйте другое фото.');
            }
            let pipeline = (0, sharp_1.default)(buffer, { failOnError: true }).rotate();
            if (metadata.width > this.maxImageDimension || metadata.height > this.maxImageDimension) {
                pipeline = pipeline.resize({
                    width: this.maxImageDimension,
                    height: this.maxImageDimension,
                    fit: 'inside',
                });
            }
            let output = await pipeline.webp({
                quality: 82,
                smartSubsample: true,
                effort: 5,
            }).toBuffer();
            if (output.length > this.maxImageSizeBytes) {
                output = await (0, sharp_1.default)(buffer, { failOnError: true })
                    .rotate()
                    .resize({
                    width: this.maxImageDimension,
                    height: this.maxImageDimension,
                    fit: 'inside',
                })
                    .webp({
                    quality: 72,
                    smartSubsample: true,
                    effort: 6,
                })
                    .toBuffer();
                this.ensureFileWithinLimit(output, this.maxImageSizeBytes, 'Изображение');
            }
            return output;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Мы не смогли обработать изображение. Убедитесь, что файл не повреждён.');
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)()
], UploadService);
//# sourceMappingURL=upload.service.js.map