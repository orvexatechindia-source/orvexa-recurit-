import { Controller, Post, Body, Get, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '@orvexa/auth';
import { createSuccessResponse } from '@orvexa/shared';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('api/v1/interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @RequirePermissions(PERMISSIONS.MANAGE_APPLICATIONS)
  @Post()
  async create(@Body() dto: CreateInterviewDto, @Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.interviewsService.create(dto, tenantId);
    return createSuccessResponse(result);
  }

  @RequirePermissions(PERMISSIONS.VIEW_CANDIDATES)
  @Get('team')
  async findTeam(@Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.interviewsService.findTeam(tenantId);
    return createSuccessResponse(result);
  }

  @RequirePermissions(PERMISSIONS.VIEW_CANDIDATES)
  @Get()
  async findAll(@Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.interviewsService.findAll(tenantId);
    return createSuccessResponse(result);
  }

  @RequirePermissions(PERMISSIONS.MANAGE_APPLICATIONS)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.interviewsService.remove(id, tenantId);
    return createSuccessResponse(result);
  }
}
