import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, hasMinRole } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If route has no @Roles decorator, it's open (default JWT protection applies via JwtAuthGuard)
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // User must be logged in for RolesGuard to apply
    if (!user) return false;

    // A BANNED user can never cross a Roles protected endpoint
    if (user.role === Role.BANNED) return false;

    // Convert string from JWT payload to Role enum type
    const userRole = user.role as Role || Role.USER;

    // Check if user matches at least ONE of the required roles (or is hierarchically superior)
    return requiredRoles.some((role) => hasMinRole(userRole, role));
  }
}
