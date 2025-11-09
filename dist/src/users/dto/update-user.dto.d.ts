import { CreateUserDto } from './create-user.dto';
import { UserRole } from '../entities/user.entity';
declare class ShippingAddressDto {
    city: string;
    postOffice: string;
    recipientName?: string;
    phoneNumber?: string;
}
declare const UpdateUserDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    role?: UserRole;
    defaultShippingAddress?: ShippingAddressDto;
}
export {};
