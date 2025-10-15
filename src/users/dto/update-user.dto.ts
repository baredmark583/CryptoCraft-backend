import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsOptional, ValidateNested, IsObject, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

class ShippingAddressDto {
    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    postOffice: string;

    @IsString()
    @IsOptional()
    recipientName?: string;

    @IsString()
    @IsOptional()
    phoneNumber?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

    @IsObject()
    @IsOptional()
    @ValidateNested()
    @Type(() => ShippingAddressDto)
    defaultShippingAddress?: ShippingAddressDto;
}
