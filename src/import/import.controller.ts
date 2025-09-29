import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ImportService } from './import.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProcessUrlDto } from './dto/process-url.dto';

@Controller('import')
@UseGuards(JwtAuthGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('process-url')
  processUrl(@Body() processUrlDto: ProcessUrlDto) {
    return this.importService.processUrl(processUrlDto.url);
  }
}
