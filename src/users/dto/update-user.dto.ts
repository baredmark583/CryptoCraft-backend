import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}