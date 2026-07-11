import { SAAS_ROLES, type SaasRole } from "@orvexa/config";

export interface JwtPayload {
  sub: string;         // User ID
  tenantId: string;    // Organization / Tenant ID
  email: string;       // User Email
  role: SaasRole;      // User Role (RBAC)
  name: string;        // Full Name
  iat?: number;
  exp?: number;
}

// RBAC Permissions Mapping
export const PERMISSIONS = {
  // Job Postings
  CREATE_JOB: 'create_job',
  EDIT_JOB: 'edit_job',
  DELETE_JOB: 'delete_job',
  VIEW_JOBS: 'view_jobs',

  // Candidates & Applications
  VIEW_CANDIDATES: 'view_candidates',
  MANAGE_APPLICATIONS: 'manage_applications',
  RATE_CANDIDATE: 'rate_candidate',

  // Tenant / Company Config
  MANAGE_TENANT: 'manage_tenant',
  MANAGE_USERS: 'manage_users',

  // Super Admin actions
  MANAGE_ALL_TENANTS: 'manage_all_tenants',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role to Permission Matrix
export const ROLE_PERMISSIONS: Record<SaasRole, Permission[]> = {
  [SAAS_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [SAAS_ROLES.CLIENT_ADMIN]: [
    PERMISSIONS.CREATE_JOB,
    PERMISSIONS.EDIT_JOB,
    PERMISSIONS.DELETE_JOB,
    PERMISSIONS.VIEW_JOBS,
    PERMISSIONS.VIEW_CANDIDATES,
    PERMISSIONS.MANAGE_APPLICATIONS,
    PERMISSIONS.RATE_CANDIDATE,
    PERMISSIONS.MANAGE_TENANT,
    PERMISSIONS.MANAGE_USERS,
  ],
  [SAAS_ROLES.RECRUITER]: [
    PERMISSIONS.CREATE_JOB,
    PERMISSIONS.EDIT_JOB,
    PERMISSIONS.VIEW_JOBS,
    PERMISSIONS.VIEW_CANDIDATES,
    PERMISSIONS.MANAGE_APPLICATIONS,
    PERMISSIONS.RATE_CANDIDATE,
  ],
  [SAAS_ROLES.HIRING_MANAGER]: [
    PERMISSIONS.VIEW_JOBS,
    PERMISSIONS.VIEW_CANDIDATES,
    PERMISSIONS.MANAGE_APPLICATIONS,
    PERMISSIONS.RATE_CANDIDATE,
  ],
  [SAAS_ROLES.CANDIDATE]: [
    PERMISSIONS.VIEW_JOBS,
  ],
};

// Check if role has explicit permission
export function hasPermission(role: SaasRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return !!permissions?.includes(permission);
}

// Role match helper
export function hasRole(userRole: SaasRole, requiredRoles: SaasRole[]): boolean {
  return requiredRoles.includes(userRole);
}

export function isSuperAdmin(role: SaasRole): boolean {
  return role === SAAS_ROLES.SUPER_ADMIN;
}

export function isClientAdmin(role: SaasRole): boolean {
  return role === SAAS_ROLES.CLIENT_ADMIN || role === SAAS_ROLES.SUPER_ADMIN;
}
