export const BRAND_COLORS = {
  navy: '#0B1220',      // Primary Dark
  blue: '#2563EB',      // Primary Blue
  cyan: '#06B6D4',      // Accent Cyan
  background: '#F8FAFC',// Light Background
  white: '#FFFFFF',     // White
};

export const TYPOGRAPHY = {
  body: 'Inter, sans-serif',
  headings: 'Space Grotesk, sans-serif',
};

export const SAAS_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CLIENT_ADMIN: 'CLIENT_ADMIN',
  RECRUITER: 'RECRUITER',
  HIRING_MANAGER: 'HIRING_MANAGER',
  CANDIDATE: 'CANDIDATE',
} as const;

export type SaasRole = typeof SAAS_ROLES[keyof typeof SAAS_ROLES];
