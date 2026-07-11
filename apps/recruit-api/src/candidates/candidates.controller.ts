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
  BadRequestException 
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

  // 2. Recruiter Candidate Directory Listing
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions(PERMISSIONS.VIEW_CANDIDATES)
  @Get()
  async findAll(@Request() req: any) {
    const tenantId = req.tenantId;
    const result = await this.candidatesService.findAll(tenantId);
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
