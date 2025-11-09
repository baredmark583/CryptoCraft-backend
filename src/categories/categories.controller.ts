import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, UseInterceptors } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { BatchCreateCategoriesDto } from './dto/batch-create-categories.dto';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';


@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @UseInterceptors(AuditInterceptor)
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @UseInterceptors(AuditInterceptor)
  @Post('batch-create')
  batchCreate(@Body() batchCreateCategoriesDto: BatchCreateCategoriesDto) {
    return this.categoriesService.batchCreate(batchCreateCategoriesDto.categories);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @UseInterceptors(AuditInterceptor)
  @Post(':parentId/import-subtree')
  importSubtree(
    @Param('parentId', ParseUUIDPipe) parentId: string,
    @Body() batchCreateCategoriesDto: BatchCreateCategoriesDto,
  ) {
    return this.categoriesService.batchCreateSubcategories(batchCreateCategoriesDto.categories, parentId);
  }

  // Public endpoint
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @UseInterceptors(AuditInterceptor)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @UseInterceptors(AuditInterceptor)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
