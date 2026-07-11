import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  Delete, 
  UseGuards, 
  Request, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException,
  Query
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { ApplyJobDto } from './dto/candidates.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '@orvexa/auth';
import { createSuccessResponse } from '@orvexa/shared';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../common/config/multer.config';

@Controller('api/v1/candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  // 1. Public Job Application Intake (Includes Resume File Uploader)
  @Post('apply')
  @UseInterceptors(FileInterceptor('resume', multerOptions))
  async apply(
    @Body() dto: ApplyJobDto,
    @UploadedFile() file: any, // Cast as any to prevent Multer namespace conflicts
    @Request() req: any
  ) {
    if (!file) {
      throw new BadRequestException('Resume document file is required.');
    }

    const tenantId = req.tenantId;
    if (!tenantId) {
      throw new BadRequestException('Multi-Tenancy Guard: Could not resolve target tenant organization.');
    }

    const result = await this.candidatesService.apply(dto, file, tenantId);
    return createSuccessResponse(result);
  }

  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(PERMISSIONS.VIEW_CANDIDATES)
  @Get()
  async findAll(
    @Request() req: any,
    @Query('query') query?: string,
    @Query('skills') skills?: string,
    @Query('minMatchScore') minMatchScore?: string,
    @Query('jobId') jobId?: string
  ) {
    const tenantId = req.tenantId;
    const result = await this.candidatesService.findAllFiltered(tenantId, {
      query,
      skills,
      minMatchScore: minMatchScore ? parseInt(minMatchScore, 10) : undefined,
      jobId
    });
    return createSuccessResponse(result);
  }

  // 3. Delete Candidate Profile (Compliance)
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(PERMISSIONS.MANAGE_APPLICATIONS)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.candidatesService.remove(id, tenantId);
    return createSuccessResponse(result);
  }
}
