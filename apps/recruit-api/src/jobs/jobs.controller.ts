import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { GenerateDescriptionDto } from './dto/generate-description.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '@orvexa/auth';
import { createSuccessResponse } from '@orvexa/shared';

@Controller('api/v1/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // AI Assistant: Generate Detailed Job Description from outline prompt
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(PERMISSIONS.CREATE_JOB)
  @Post('generate-description')
  async generateDescription(@Body() dto: GenerateDescriptionDto, @Request() req: any) {
    const tenantId = req.tenantId;
    const description = await this.jobsService.generateDescription(dto.outline, tenantId);
    return createSuccessResponse({ description });
  }

  // 1. Create Job
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(PERMISSIONS.CREATE_JOB)
  @Post()
  async create(@Body() dto: CreateJobDto, @Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.jobsService.create(dto, tenantId);
    return createSuccessResponse(result);
  }

  // 2. Internal Recruiter View Listings
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(PERMISSIONS.VIEW_JOBS)
  @Get()
  async findAll(@Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.jobsService.findAll(tenantId);
    return createSuccessResponse(result);
  }

  // 3. Public Candidate Page Listings (Unauthenticated)
  @Get('public/:domain')
  async findPublicList(@Param('domain') domain: string) {
    const result = await this.jobsService.findPublicList(domain);
    return createSuccessResponse(result);
  }

  // 4. Get Single Job details (Internal)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.jobsService.findOne(id, tenantId);
    return createSuccessResponse(result);
  }

  // 5. Update Job Posting
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(PERMISSIONS.EDIT_JOB)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
    @Request() req: any
  ) {
    const tenantId = req.tenantId;
    const result = await this.jobsService.update(id, dto, tenantId);
    return createSuccessResponse(result);
  }

  // 6. Delete Job Posting
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(PERMISSIONS.DELETE_JOB)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.jobsService.remove(id, tenantId);
    return createSuccessResponse(result);
  }
}
