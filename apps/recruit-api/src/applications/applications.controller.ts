import { Controller, Get, Patch, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { UpdateApplicationStageDto } from './dto/application.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '@orvexa/auth';
import { createSuccessResponse } from '@orvexa/shared';

@Controller('api/v1/applications')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  // 1. Fetch Candidate Applications (Optionally filtered by Job vacancy ID)
  @RequirePermissions(PERMISSIONS.VIEW_CANDIDATES)
  @Get()
  async findAll(
    @Request() req: any,
    @Query('jobId') jobId?: string
  ) {
    const tenantId = req.tenantId;
    const result = await this.applicationsService.findAll(tenantId, jobId);
    return createSuccessResponse(result);
  }

  // 3. Fetch Single Application Details (AI summaries, gaps, and suggested questions)
  @RequirePermissions(PERMISSIONS.VIEW_CANDIDATES)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.applicationsService.findOne(id, tenantId);
    return createSuccessResponse(result);
  }

  // 2. Transition Applicant Stage / Status
  @RequirePermissions(PERMISSIONS.MANAGE_APPLICATIONS)
  @Patch(':id/stage')
  async updateStage(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStageDto,
    @Request() req: any
  ) {
    const tenantId = req.tenantId;
    const result = await this.applicationsService.updateStage(id, dto.status, tenantId);
    return createSuccessResponse(result);
  }

  @RequirePermissions(PERMISSIONS.VIEW_CANDIDATES)
  @Post(':id/ai-questions')
  async generateInterviewQuestions(
    @Param('id') id: string,
    @Body() body: { focusTopic?: string },
    @Request() req: any
  ) {
    const tenantId = req.tenantId;
    const result = await this.applicationsService.generateInterviewQuestions(id, body.focusTopic, tenantId);
    return createSuccessResponse(result);
  }

  @RequirePermissions(PERMISSIONS.VIEW_CANDIDATES)
  @Get(':id/notes')
  async getNotes(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.applicationsService.getNotes(id, tenantId);
    return createSuccessResponse(result);
  }

  @RequirePermissions(PERMISSIONS.MANAGE_APPLICATIONS)
  @Post(':id/notes')
  async addNote(
    @Param('id') id: string,
    @Body() body: { message: string; isInternal?: boolean },
    @Request() req: any
  ) {
    const tenantId = req.tenantId;
    const authorId = req.user.id;
    const result = await this.applicationsService.addNote(id, authorId, body.message, body.isInternal ?? true, tenantId);
    return createSuccessResponse(result);
  }
}
