import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { hasPermission } from '@orvexa/auth';
import { SaasRole } from '@orvexa/config';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    // MULTI-TENANCY SANITY CHECK:
    // Prevent Tenant A users from accessing Tenant B resources.
    // SUPER_ADMIN can bypass this check to manage all tenants.
    const requestTenantId = request['tenantId'];
    if (requestTenantId && user.tenantId !== requestTenantId && user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Security Violation: Access across tenant boundaries is strictly forbidden.');
    }

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // PERMISSIONS VALIDATION:
    // Verify that the user's role grants them all required permissions for the endpoint.
    const userRole = user.role as SaasRole;
    const hasAll = requiredPermissions.every((permission: any) => hasPermission(userRole, permission));

    if (!hasAll) {
      throw new ForbiddenException('Access Denied: You do not have the required permissions to perform this action.');
    }

    return true;
  }
}
