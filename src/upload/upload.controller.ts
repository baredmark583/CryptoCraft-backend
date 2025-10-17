// FIX: Removed the local import of `Express` to fix the `Namespace 'Express' has no exported member 'Multer'` error. The `import 'multer';` statement is sufficient as its type definitions augment the global Express namespace.
// FIX: Changed `import type` to a standard `import` for `Express` to ensure the Express namespace is available for Multer's type augmentation, resolving the 'Express.Multer' type error.
// FIX: Removed local import of Express to allow global namespace augmentation from 'multer' to work correctly.
import 'multer';
// FIX: Add an empty import from 'express' to trigger TypeScript to load the Express namespace, which is augmented by 'multer'. This resolves the "Cannot find namespace 'Express'" error.
import {} from 'express';
import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.uploadFile(file);
  }

  @Post('url')
  @UseGuards(JwtAuthGuard)
  uploadFileFromUrl(@Body('url') imageUrl: string) {
    return this.uploadService.uploadFileFromUrl(imageUrl);
  }
}
