import { Controller, Post, Body, Get, Param, Query, UseGuards, Request, NotFoundException, Delete } from '@nestjs/common';
import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldDto, SaveCustomValuesDto } from './dto/custom-fields.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '@orvexa/auth';
import { createSuccessResponse } from '@orvexa/shared';
import { CustomFieldEntityType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/v1/custom-fields')
export class CustomFieldsController {
  constructor(
    private readonly customFieldsService: CustomFieldsService,
    private readonly prisma: PrismaService
  ) {}

  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(PERMISSIONS.CREATE_JOB)
  @Post()
  async createField(@Body() dto: CreateCustomFieldDto, @Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.customFieldsService.createField(dto, tenantId);
    return createSuccessResponse(result);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(PERMISSIONS.VIEW_JOBS)
  @Get()
  async getFields(@Query('entityType') entityType: CustomFieldEntityType, @Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.customFieldsService.getFields(tenantId, entityType);
    return createSuccessResponse(result);
  }

  // Public candidate portal configuration endpoint
  @Get('public/:domain')
  async getPublicFields(
    @Param('domain') domain: string,
    @Query('entityType') entityType: CustomFieldEntityType
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { domain }
    });

    if (!tenant) {
      throw new NotFoundException(`Organization with domain "${domain}" not found.`);
    }

    const result = await this.customFieldsService.getFields(tenant.id, entityType);
    return createSuccessResponse(result);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Post('values')
  async saveValues(@Body() dto: SaveCustomValuesDto, @Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.customFieldsService.saveValues(dto, tenantId);
    return createSuccessResponse(result);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @Get('values/:entityId')
  async getValues(@Param('entityId') entityId: string, @Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.customFieldsService.getValues(entityId, tenantId);
    return createSuccessResponse(result);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(PERMISSIONS.CREATE_JOB)
  @Delete(':id')
  async deleteField(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.customFieldsService.deleteField(id, tenantId);
    return createSuccessResponse(result);
  }
}
