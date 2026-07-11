import { SetMetadata } from '@nestjs/common';
import { Permission } from '@orvexa/auth';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) => SetMetadata(PERMISSIONS_KEY, permissions);
