
import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  // Fix: Changed Express.Multer.File to any to resolve missing type definition errors.
  async uploadFile(file: any): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('Make sure that the file is uploaded');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto', // Automatically detect image or video
          folder: 'cryptocraft', // Optional: organize uploads in a folder
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve({ url: result.secure_url });
        },
      );

      const readableStream = new Readable();
      readableStream._read = () => {}; // _read is required but can be a no-op
      readableStream.push(file.buffer);
      readableStream.push(null);

      readableStream.pipe(uploadStream);
    });
  }
}