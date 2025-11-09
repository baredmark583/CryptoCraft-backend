import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ApproveProductDto } from './dto/approve-product.dto';
import { RejectProductDto } from './dto/reject-product.dto';
import { AppealProductDto } from './dto/appeal-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query() query: FindProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.SUPER_ADMIN)
  @Post(':id/moderation/approve')
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveProductDto,
    @Req() req: any,
  ) {
    return this.productsService.approveProduct(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.SUPER_ADMIN)
  @Post(':id/moderation/reject')
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectProductDto,
    @Req() req: any,
  ) {
    return this.productsService.rejectProduct(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/moderation/appeal')
  appeal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AppealProductDto,
    @Req() req: any,
  ) {
    return this.productsService.appealProduct(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/moderation/events')
  getModerationEvents(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.productsService.getModerationEvents(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: any,
  ) {
    return this.productsService.update(id, updateProductDto, req.user?.id, req.user?.role);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/revisions')
  getRevisions(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.productsService.getRevisions(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/revisions/:revisionId/restore')
  restoreRevision(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('revisionId', ParseUUIDPipe) revisionId: string,
    @Req() req: any,
  ) {
    return this.productsService.restoreRevision(id, revisionId, req.user.id, req.user.role);
  }
}
