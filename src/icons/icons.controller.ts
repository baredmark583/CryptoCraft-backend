import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { IconsService } from './icons.service';
import { CreateIconDto } from './dto/create-icon.dto';
import { UpdateIconDto } from './dto/update-icon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('icons')
export class IconsController {
  constructor(private readonly iconsService: IconsService) {}

  @Get('/public')
  findAllPublic() {
    return this.iconsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createIconDto: CreateIconDto) {
    return this.iconsService.create(createIconDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('upsert')
  upsert(@Body() upsertIconDto: CreateIconDto) {
    return this.iconsService.upsert(upsertIconDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.iconsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.iconsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateIconDto: UpdateIconDto) {
    return this.iconsService.update(id, updateIconDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.iconsService.remove(id);
  }
}
