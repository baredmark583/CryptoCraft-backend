import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // Если роли не указаны, доступ разрешен
    }
    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.role) {
        throw new ForbiddenException('You do not have the necessary permissions.');
    }

    const hasPermission = requiredRoles.some((role) => user.role === role);

    if (!hasPermission) {
        throw new ForbiddenException('You do not have the necessary permissions.');
    }
    
    return true;
  }
}
