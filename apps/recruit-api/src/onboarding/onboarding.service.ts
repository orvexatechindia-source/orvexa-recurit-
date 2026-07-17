import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { SaasRole } from '@prisma/client';
import { createSuccessResponse } from '@orvexa/shared';
import * as dns from 'dns';
import { promisify } from 'util';

export class OnboardTenantDto {
  companyName!: string;
  adminName!: string;
  adminEmail!: string;
  adminPasswordHash!: string;
  domain?: string;
}

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService
  ) {}

  async onboard(dto: OnboardTenantDto) {
    // 1. Verify email domain legitimacy using MX record lookup
    const emailDomain = dto.adminEmail.split('@')[1];
    const isTestDomain = emailDomain === 'localhost' || emailDomain.endsWith('.local') || emailDomain === 'lha.co.uk' || emailDomain === 'orvexarecruit.com';
    
    if (emailDomain && !isTestDomain) {
      try {
        const resolveMx = promisify(dns.resolveMx);
        const mxRecords = await resolveMx(emailDomain);
        if (!mxRecords || mxRecords.length === 0) {
          throw new BadRequestException('Verification failed: The email domain does not have active MX records (cannot receive mail).');
        }
      } catch (err) {
        throw new BadRequestException('Verification failed: The email domain is invalid or cannot receive mail.');
      }
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.adminEmail },
    });

    if (existingUser) {
      throw new BadRequestException('A user with this email address already exists.');
    }

    if (dto.domain) {
      const existingTenant = await this.prisma.tenant.findUnique({
        where: { domain: dto.domain },
      });
      if (existingTenant) {
        throw new BadRequestException('This subdomain/domain is already registered.');
      }
    }

    const hashedPassword = await this.authService.hashPassword(dto.adminPasswordHash);

    // Run creation inside a secure transactional block
    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.companyName,
          domain: dto.domain || dto.companyName.toLowerCase().replace(/[^a-z0-9]/g, ''),
        },
      });

      const user = await tx.user.create({
        data: {
          email: dto.adminEmail,
          passwordHash: hashedPassword,
          name: dto.adminName,
          role: SaasRole.CLIENT_ADMIN,
          tenantId: tenant.id,
        },
      });

      // Write initial log to the audit trail
      await tx.auditLog.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          action: 'ONBOARD_ORGANIZATION',
          entityName: 'Tenant',
          entityId: tenant.id,
          metadata: {
            adminEmail: user.email,
            companyName: tenant.name,
          },
        },
      });

      return { tenant, user };
    });

    return {
      message: 'Organization onboarded successfully.',
      tenantId: result.tenant.id,
      companyName: result.tenant.name,
      domain: result.tenant.domain,
      admin: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
    };
  }

  async findAllTenants() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            jobs: true,
            candidates: true,
            applications: true,
          },
        },
      },
    });
  }

  async updateTenantStatus(
    id: string,
    dto: { status?: string; subscriptionExpiry?: string; gracePeriodDays?: number }
  ) {
    const data: any = {};
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.subscriptionExpiry !== undefined) {
      data.subscriptionExpiry = dto.subscriptionExpiry ? new Date(dto.subscriptionExpiry) : null;
    }
    if (dto.gracePeriodDays !== undefined) data.gracePeriodDays = dto.gracePeriodDays;

    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }
}
