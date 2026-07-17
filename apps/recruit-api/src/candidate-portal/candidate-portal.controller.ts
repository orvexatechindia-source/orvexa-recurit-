import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CandidatePortalService } from './candidate-portal.service';
import { RequestPasscodeDto, VerifyPasscodeDto, UpdateOfferStatusDto, ExtendOfferDto } from './dto/candidate-portal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '@orvexa/auth';
import { createSuccessResponse } from '@orvexa/shared';

@Controller('api/v1/candidate-portal')
export class CandidatePortalController {
  constructor(private readonly candidatePortalService: CandidatePortalService) {}

  // 1. Request secure 6-digit magic passcode email
  @Post('request-passcode')
  async requestPasscode(@Body() dto: RequestPasscodeDto) {
    const result = await this.candidatePortalService.requestPasscode(dto.email, dto.domain);
    return createSuccessResponse(result);
  }

  // 2. Verify login passcode and issue verification token
  @Post('verify-passcode')
  async verifyPasscode(@Body() dto: VerifyPasscodeDto) {
    const result = await this.candidatePortalService.verifyPasscode(dto.email, dto.code, dto.domain);
    return createSuccessResponse(result);
  }

  // 3. Candidate tracks their applications status list
  @UseGuards(JwtAuthGuard)
  @Get('applications')
  async getApplications(@Request() req: any) {
    const email = req.user.email;
    const tenantId = req.user.tenantId;
    const result = await this.candidatePortalService.getApplications(email, tenantId);
    return createSuccessResponse(result);
  }

  // 4. Candidate signs / accepts / declines extended job offer letter
  @UseGuards(JwtAuthGuard)
  @Post('applications/:id/offer')
  async updateOfferStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOfferStatusDto,
    @Request() req: any
  ) {
    const email = req.user.email;
    const tenantId = req.user.tenantId;
    const result = await this.candidatePortalService.updateOfferStatus(id, email, tenantId, dto.status, dto.signature);
    return createSuccessResponse(result);
  }

  // 5. Recruiter extends job offer terms (Internal Recruiter Route)
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(PERMISSIONS.MANAGE_APPLICATIONS)
  @Post('recruiter/extend-offer/:id')
  async extendOffer(
    @Param('id') id: string,
    @Body() dto: ExtendOfferDto,
    @Request() req: any
  ) {
    const tenantId = req.tenantId;
    const result = await this.candidatePortalService.extendOffer(id, dto.offerLetter, tenantId);
    return createSuccessResponse(result);
  }
}
