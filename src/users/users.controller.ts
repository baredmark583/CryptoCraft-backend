import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('users')
// @UseGuards(JwtAuthGuard, RolesGuard) // REMOVED from controller level
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id/details')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  findOneWithDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOneWithDetails(id);
  }

  @Get(':id')
  // No guards - this is now a public endpoint
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard) // Only check for a valid token
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    const requestingUser = req.user;

    // A user can update their own profile, OR a super admin can update any profile.
    if (
      requestingUser.role !== UserRole.SUPER_ADMIN &&
      requestingUser.userId !== id
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this user.',
      );
    }

    // A non-admin user cannot change their role. An admin can.
    if (
      requestingUser.role !== UserRole.SUPER_ADMIN &&
      updateUserDto.role
    ) {
      throw new ForbiddenException('You are not allowed to change user roles.');
    }
    
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}