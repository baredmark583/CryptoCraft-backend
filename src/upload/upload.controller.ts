// FIX: Removed explicit 'Express' import. The 'Express' namespace with the 'Multer' member is made available globally by importing 'multer', which resolves the type error.
import 'multer';
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
