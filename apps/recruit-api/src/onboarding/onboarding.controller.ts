import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { OnboardingService, OnboardTenantDto } from './onboarding.service';
import { createSuccessResponse } from '@orvexa/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '@orvexa/auth';

@Controller('api/v1/onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  async onboard(@Body() body: OnboardTenantDto) {
    const result = await this.onboardingService.onboard(body);
    return createSuccessResponse(result);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(PERMISSIONS.MANAGE_ALL_TENANTS)
  @Get('tenants')
  async findAllTenants() {
    const result = await this.onboardingService.findAllTenants();
    return createSuccessResponse(result);
  }
}
