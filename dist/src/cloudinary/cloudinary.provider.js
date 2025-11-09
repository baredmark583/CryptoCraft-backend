"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryProvider = exports.CLOUDINARY = void 0;
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
exports.CLOUDINARY = 'Cloudinary';
exports.CloudinaryProvider = {
    provide: exports.CLOUDINARY,
    useFactory: (configService) => {
        const cloudinaryUrl = configService.get('CLOUDINARY_URL');
        console.log('--- CLOUDINARY PROVIDER DIAGNOSTIC ---');
        console.log(`Attempting to configure Cloudinary. CLOUDINARY_URL from ConfigService: [${cloudinaryUrl}]`);
        console.log(`Type of CLOUDINARY_URL: ${typeof cloudinaryUrl}`);
        console.log('--- END DIAGNOSTIC ---');
        if (!cloudinaryUrl) {
            throw new Error('CLOUDINARY_URL is not configured in environment variables. Please check your .env file or Render environment settings.');
        }
        return cloudinary_1.v2.config({
            cloudinary_url: cloudinaryUrl,
        });
    },
    inject: [config_1.ConfigService],
};
//# sourceMappingURL=cloudinary.provider.js.map