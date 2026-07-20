import { Controller, Post, Body, Get, Query, Res, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '@orvexa/auth';
import { createSuccessResponse } from '@orvexa/shared';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('api/v1/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @RequirePermissions(PERMISSIONS.VIEW_CANDIDATES)
  @Get('export/csv')
  async exportCsv(@Request() req: any, @Res() res: any) {
    const tenantId = req.tenantId;
    const csvData = await this.reviewsService.exportReviewsCsv(tenantId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="scorecards_export.csv"');
    return res.send(csvData);
  }

  @RequirePermissions(PERMISSIONS.MANAGE_APPLICATIONS)
  @Post()
  async create(@Body() dto: CreateReviewDto, @Request() req: any) {
    const tenantId = req.tenantId;
    const interviewerId = req.user.id; // From JwtAuthGuard user extraction
    const result = await this.reviewsService.create(dto, interviewerId, tenantId);
    return createSuccessResponse(result);
  }

  @RequirePermissions(PERMISSIONS.VIEW_CANDIDATES)
  @Get()
  async findAll(@Request() req: any, @Query('applicationId') applicationId?: string) {
    const tenantId = req.tenantId;
    if (applicationId) {
      const result = await this.reviewsService.findAllForApplication(applicationId, tenantId);
      return createSuccessResponse(result);
    }
    const result = await this.reviewsService.findAll(tenantId);
    return createSuccessResponse(result);
  }
}
