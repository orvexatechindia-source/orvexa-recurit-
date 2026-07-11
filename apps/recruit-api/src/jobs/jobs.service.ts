import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { JobStatus } from '@prisma/client';

import { AiService } from '../ai/ai.service';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService
  ) {}

  async generateDescription(outline: string, tenantId: string) {
    return this.aiService.generateDescription(outline, tenantId);
  }

  async create(dto: CreateJobDto, tenantId: string) {
    return this.prisma.job.create({
      data: {
        title: dto.title,
        description: dto.description,
        requirements: dto.requirements,
        location: dto.location || 'Remote',
        status: dto.status || JobStatus.DRAFT,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    // List all jobs inside this tenant workspace (includes counts of candidate applications)
    return this.prisma.job.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });
  }

  async findPublicList(tenantDomain: string) {
    // 1. Resolve tenant domain
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          { domain: tenantDomain },
          { name: { equals: tenantDomain, mode: 'insensitive' } }
        ]
      }
    });

    if (!tenant) {
      throw new NotFoundException(`Organization workspace "${tenantDomain}" not found.`);
    }

    // 2. Fetch only PUBLISHED vacancies for candidate view
    return this.prisma.job.findMany({
      where: {
        tenantId: tenant.id,
        status: JobStatus.PUBLISHED,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID "${id}" not found.`);
    }

    if (job.tenantId !== tenantId) {
      throw new ForbiddenException('Access Denied: You do not have access to this resource.');
    }

    return job;
  }

  async update(id: string, dto: UpdateJobDto, tenantId: string) {
    // Validate existence & ownership first
    await this.findOne(id, tenantId);

    return this.prisma.job.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        requirements: dto.requirements,
        location: dto.location,
        status: dto.status,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    // Validate existence & ownership first
    await this.findOne(id, tenantId);

    await this.prisma.job.delete({
      where: { id },
    });

    return { success: true, message: `Job vacancy deleted successfully.` };
  }
}
