import { Injectable, NestMiddleware, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let tenantId = req.headers['x-tenant-id'] as string;

    // Resolve from JWT authorization token if available
    let userRole: string | undefined;
    const authHeader = req.headers['authorization'] as string;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (payload) {
            if (payload.tenantId && !tenantId) {
              tenantId = payload.tenantId;
            }
            userRole = payload.role;
          }
        }
      } catch (err) {
        // Ignore parse errors, fallback to other resolution steps
      }
    }

    // For public onboarding and authentication paths, tenantId might not be established yet.
    const publicPaths = [
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/auth/refresh',
      '/api/v1/onboarding',
      '/api/v1/jobs/public',
      '/api/v1/candidates/apply',
      '/api/v1/candidate-portal/request-passcode',
      '/api/v1/candidate-portal/verify-passcode',
      '/api/v1/custom-fields/public'
    ];
    
    const isPublic = publicPaths.some(path => req.originalUrl.includes(path));

    if (!tenantId) {
      // 1. Resolve from custom header (very helpful for local testing)
      const domainHeader = req.headers['x-tenant-domain'] as string;
      if (domainHeader) {
        const tenant = await this.prisma.tenant.findFirst({
          where: {
            OR: [
              { domain: domainHeader },
              { name: { equals: domainHeader, mode: 'insensitive' } }
            ]
          }
        });
        if (tenant) {
          tenantId = tenant.id;
        }
      }

      // 2. Fallback to subdomain/host resolution
      if (!tenantId) {
        const host = req.headers.host || '';
        const parts = host.split('.');
        if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
          const subdomain = parts[0];
          if (subdomain) {
            const tenant = await this.prisma.tenant.findFirst({
              where: {
                OR: [
                  { domain: subdomain },
                  { name: { equals: subdomain, mode: 'insensitive' } }
                ]
              }
            });
            if (tenant) {
              tenantId = tenant.id;
            }
          }
        }
      }
    }

    if (!tenantId && !isPublic) {
      throw new BadRequestException('Multi-Tenancy Isolation Guard: Missing X-Tenant-ID header or unresolved tenant subdomain.');
    }

    if (tenantId) {
      // Ingress check: Validate that the tenant exists in the database
      const tenantExists = await this.prisma.tenant.findUnique({
        where: { id: tenantId }
      });
      if (!tenantExists) {
        throw new BadRequestException(`Multi-Tenancy Isolation Guard: Tenant ID "${tenantId}" not found.`);
      }

      // LICENSE STATUS CHECK (except for billing routes, public routes, or super-admins)
      const isBillingPath = req.originalUrl.includes('/api/v1/billing');
      const isSuperAdmin = userRole === 'SUPER_ADMIN';
      if (tenantExists.status === 'SUSPENDED' && !isBillingPath && !isPublic && !isSuperAdmin) {
        throw new HttpException(
          'Subscription Suspended: Please visit your Billing Settings to renew your license.',
          HttpStatus.PAYMENT_REQUIRED
        );
      }

      // Expiry check
      if (tenantExists.subscriptionExpiry && !isBillingPath && !isPublic && !isSuperAdmin) {
        const expiryDate = new Date(tenantExists.subscriptionExpiry);
        const graceExpiry = new Date(expiryDate.getTime() + tenantExists.gracePeriodDays * 24 * 60 * 60 * 1000);
        if (new Date() > graceExpiry) {
          throw new HttpException(
            'Subscription Expired: Please complete payment to reactivate your workspace.',
            HttpStatus.PAYMENT_REQUIRED
          );
        }
      }

      (req as any)['tenantId'] = tenantId;
    }

    next();
  }
}
