import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { IconsService } from './icons.service';
import { CreateIconDto } from './dto/create-icon.dto';
import { UpdateIconDto } from './dto/update-icon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('icons')
@UseGuards(JwtAuthGuard)
export class IconsController {
  constructor(private readonly iconsService: IconsService) {}

  @Post()
  create(@Body() createIconDto: CreateIconDto) {
    return this.iconsService.create(createIconDto);
  }

  @Get()
  findAll() {
    return this.iconsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.iconsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateIconDto: UpdateIconDto) {
    return this.iconsService.update(id, updateIconDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.iconsService.remove(id);
  }
}