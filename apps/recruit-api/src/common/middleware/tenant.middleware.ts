import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let tenantId = req.headers['x-tenant-id'] as string;

    // For public onboarding and authentication paths, tenantId might not be established yet.
    const publicPaths = [
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/auth/refresh',
      '/api/v1/onboarding',
      '/api/v1/jobs/public',
      '/api/v1/candidates/apply'
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
      (req as any)['tenantId'] = tenantId;
    }

    next();
  }
}
