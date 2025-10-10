import { Controller, Get, Post, Body, Param, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { LivestreamsService } from './livestreams.service';
import { CreateLivestreamDto } from './dto/create-livestream.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('livestreams')
export class LivestreamsController {
  constructor(private readonly livestreamsService: LivestreamsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() createLivestreamDto: CreateLivestreamDto) {
    return this.livestreamsService.create(req.user.userId, createLivestreamDto);
  }

  @Get()
  findAll() {
    return this.livestreamsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.livestreamsService.findOne(id);
  }
}
