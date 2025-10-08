import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export const CLOUDINARY = 'Cloudinary';

export const CloudinaryProvider: Provider = {
  provide: CLOUDINARY,
  useFactory: (configService: ConfigService) => {
    const cloudinaryUrl = configService.get<string>('CLOUDINARY_URL');
    
    // --- NEW DIAGNOSTIC LOG ---
    // This will log the value right before it's used. This is more reliable.
    console.log('--- CLOUDINARY PROVIDER DIAGNOSTIC ---');
    console.log(`Attempting to configure Cloudinary. CLOUDINARY_URL from ConfigService: [${cloudinaryUrl}]`);
    console.log(`Type of CLOUDINARY_URL: ${typeof cloudinaryUrl}`);
    console.log('--- END DIAGNOSTIC ---');

    if (!cloudinaryUrl) {
      throw new Error('CLOUDINARY_URL is not configured in environment variables. Please check your .env file or Render environment settings.');
    }

    // The cloudinary library itself will throw an error if the format is wrong.
    // This is good, we don't need to add our own regex check.
    return cloudinary.config({
        cloudinary_url: cloudinaryUrl,
    });
  },
  inject: [ConfigService],
};