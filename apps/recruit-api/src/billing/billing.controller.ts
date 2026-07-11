import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CheckoutDto, UpdateCountryDto } from './dto/billing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '@orvexa/auth';
import { createSuccessResponse } from '@orvexa/shared';

@Controller('api/v1/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // 1. Get current billing status of this tenant
  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getStatus(@Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.billingService.getBillingStatus(tenantId);
    return createSuccessResponse(result);
  }

  // 2. Update organization country
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(PERMISSIONS.MANAGE_TENANT)
  @Post('country')
  async updateCountry(@Body() dto: UpdateCountryDto, @Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.billingService.updateCountry(tenantId, dto.country);
    return createSuccessResponse(result);
  }

  // 3. Initialize checkout session
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(PERMISSIONS.MANAGE_TENANT)
  @Post('checkout')
  async checkout(@Body() dto: CheckoutDto, @Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.billingService.createCheckoutSession(tenantId, dto.plan);
    return createSuccessResponse(result);
  }

  // 4. Mimic payment gateways webhooks (Stripe, Razorpay, PayPal) - Unauthenticated public callback
  @Post('webhooks/:provider')
  async webhookCallback(@Param('provider') provider: string, @Body() body: any) {
    const result = await this.billingService.processMockWebhook(provider, body);
    return createSuccessResponse(result);
  }
}
