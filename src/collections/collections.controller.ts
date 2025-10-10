import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { AddProductDto } from './dto/add-product.dto';

@Controller('collections')
@UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  create(@Req() req, @Body() createDto: CreateCollectionDto) {
    return this.collectionsService.create(req.user.userId, createDto);
  }

  @Get()
  findByUser(@Req() req) {
    return this.collectionsService.findByUserId(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.collectionsService.findOne(id, req.user.userId);
  }
  
  @Post(':id/products')
  addProduct(
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addProductDto: AddProductDto
  ) {
    return this.collectionsService.addProduct(id, addProductDto.productId, req.user.userId);
  }

  @Delete(':id/products/:productId')
  removeProduct(
    @Req() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.collectionsService.removeProduct(id, productId, req.user.userId);
  }
}