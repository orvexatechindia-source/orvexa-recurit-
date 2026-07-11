import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, jobId?: string) {
    const whereClause: any = { tenantId };
    if (jobId) {
      whereClause.jobId = jobId;
    }

    return this.prisma.application.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      include: {
        candidate: true,
        job: {
          select: { title: true },
        },
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        candidate: true,
        job: true,
        interviews: {
          include: {
            interviewer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            startTime: 'asc',
          },
        },
        reviews: {
          include: {
            interviewer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID "${id}" not found.`);
    }

    if (application.tenantId !== tenantId) {
      throw new ForbiddenException('Access Denied: You do not have access to this resource.');
    }

    // Fetch custom values linked to Candidate or Job
    const customValues = await this.prisma.customValue.findMany({
      where: {
        tenantId,
        entityId: { in: [application.candidateId, application.jobId] }
      },
      include: {
        field: true
      }
    });

    const candidateValues = customValues.filter(v => v.entityId === application.candidateId);
    const jobValues = customValues.filter(v => v.entityId === application.jobId);

    return {
      ...application,
      candidate: {
        ...application.candidate,
        customValues: candidateValues
      },
      job: {
        ...application.job,
        customValues: jobValues
      }
    };
  }

  async updateStage(id: string, status: ApplicationStatus, tenantId: string) {
    // 1. Ownership & existence check
    const application = await this.findOne(id, tenantId);

    // 2. Perform database update
    const updated = await this.prisma.application.update({
      where: { id },
      data: { status },
      include: {
        candidate: true,
        job: {
          select: { title: true },
        },
      },
    });

    // 3. Create Audit Trail Log
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        action: `TRANSITION_APPLICATION_STAGE`,
        entityName: 'Application',
        entityId: id,
        metadata: {
          previousStatus: application.status,
          newStatus: status,
          candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
          jobTitle: application.job.title,
        },
      },
    });

    return updated;
  }
}
