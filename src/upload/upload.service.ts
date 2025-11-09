// FIX: Import the `Express` type to make the global Express namespace available, which is augmented by 'multer'. This resolves the "Cannot find namespace 'Express'" error.
import type { Express } from 'express';
import 'multer';
import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import axios from 'axios';
// FIX: Explicitly import Buffer to resolve TypeScript 'Cannot find name' error.
import { Buffer } from 'buffer';
import sharp from 'sharp';

@Injectable()
export class UploadService {
  private readonly allowedImageMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/heic',
    'image/heif',
  ]);

  private readonly maxImageSizeBytes =
    Number(process.env.UPLOAD_MAX_IMAGE_SIZE_BYTES) || 8 * 1024 * 1024; // 8MB
  private readonly maxVideoSizeBytes =
    Number(process.env.UPLOAD_MAX_VIDEO_SIZE_BYTES) || 60 * 1024 * 1024; // 60MB
  private readonly maxImageDimension =
    Number(process.env.UPLOAD_MAX_IMAGE_DIMENSION) || 1920;

  async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('Make sure that the file is uploaded');
    }

    const { buffer, resourceType } = await this.prepareBufferForUpload(
      file.buffer,
      file.mimetype,
    );
    return this.uploadBuffer(buffer, resourceType);
  }

  async uploadFileFromUrl(imageUrl: string): Promise<{ url: string }> {
    if (!imageUrl) {
      throw new BadRequestException('Image URL is required');
    }

    try {
      // Download image as a buffer
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        },
        timeout: 45000,
      });
      const buffer = Buffer.from(response.data, 'binary');
      const contentType = response.headers['content-type'] as string | undefined;
      const { buffer: processed, resourceType } = await this.prepareBufferForUpload(
        buffer,
        contentType,
      );

      return this.uploadBuffer(processed, resourceType);
    } catch (error) {
      console.error(`Failed to download or upload image from URL: ${imageUrl}`, error);
      throw new BadRequestException(`Could not process image from URL. It may be invalid or protected.`);
    }
  }

  private uploadBuffer(buffer: Buffer, resourceType: 'image' | 'auto' | 'video' = 'auto') {
    return new Promise<{ url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: 'cryptocraft',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve({ url: result.secure_url });
        },
      );

      const readableStream = new Readable();
      readableStream._read = () => {};
      readableStream.push(buffer);
      readableStream.push(null);

      readableStream.pipe(uploadStream);
    });
  }

  private async prepareBufferForUpload(buffer: Buffer, mimeType?: string) {
    if (mimeType?.startsWith('video/')) {
      this.ensureFileWithinLimit(buffer, this.maxVideoSizeBytes, 'Видео');
      return { buffer, resourceType: 'video' as const };
    }

    if (mimeType && !mimeType.startsWith('image/')) {
      throw new BadRequestException('Поддерживаются только изображения JPG, PNG, WebP, AVIF или HEIC.');
    }

    const optimized = await this.optimizeImage(buffer, mimeType);
    return { buffer: optimized, resourceType: 'image' as const };
  }

  private ensureFileWithinLimit(buffer: Buffer, limitBytes: number, label: string) {
    if (buffer.length > limitBytes) {
      const mb = (limitBytes / (1024 * 1024)).toFixed(1);
      throw new BadRequestException(`${label} превышает допустимый размер (${mb} МБ).`);
    }
  }

  private async optimizeImage(buffer: Buffer, mimeType?: string): Promise<Buffer> {
    if (mimeType && !this.allowedImageMimeTypes.has(mimeType)) {
      throw new BadRequestException('Этот формат изображения не поддерживается. Используйте JPG, PNG, WebP, AVIF или HEIC.');
    }

    try {
      const metadata = await sharp(buffer, { failOnError: true }).metadata();
      if (!metadata.width || !metadata.height) {
        throw new BadRequestException('Не удалось определить размер изображения. Попробуйте другое фото.');
      }

      let pipeline = sharp(buffer, { failOnError: true }).rotate();
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
        output = await sharp(buffer, { failOnError: true })
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
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Мы не смогли обработать изображение. Убедитесь, что файл не повреждён.');
    }
  }
}
