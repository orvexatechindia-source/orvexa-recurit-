import { Controller, Post, Body } from '@nestjs/common';
import { OnboardingService, OnboardTenantDto } from './onboarding.service';
import { createSuccessResponse } from '@orvexa/shared';

@Controller('api/v1/onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  async onboard(@Body() body: OnboardTenantDto) {
    const result = await this.onboardingService.onboard(body);
    return createSuccessResponse(result);
  }
}
