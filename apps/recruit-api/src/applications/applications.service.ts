import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';
import { SesService } from '../notifications/ses.service';
import { AiService } from '../ai/ai.service';
import { 
  getScreeningTemplate, 
  getInterviewInvitationTemplate, 
  getOfferLetterTemplate, 
  getRejectionTemplate, 
  getWelcomeTemplate 
} from '@orvexa/notifications';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sesService: SesService,
    private readonly aiService: AiService
  ) {}

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

    // 4. Send Stage Change Auto-Emails
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId }
      });
      const companyName = tenant?.name || 'Orvexatech';
      const candidateName = `${updated.candidate.firstName} ${updated.candidate.lastName}`;
      const jobTitle = updated.job.title;
      let emailPayload = null;

      if (status === ApplicationStatus.SCREENING) {
        emailPayload = getScreeningTemplate(candidateName, jobTitle, companyName);
      } else if (status === ApplicationStatus.INTERVIEWING) {
        const scheduleUrl = `http://${tenant?.domain || 'localhost:3000'}/careers/${tenant?.domain}/portal/dashboard`;
        emailPayload = getInterviewInvitationTemplate(candidateName, jobTitle, companyName, scheduleUrl);
      } else if (status === ApplicationStatus.OFFER) {
        const offerUrl = `http://${tenant?.domain || 'localhost:3000'}/careers/${tenant?.domain}/portal/dashboard`;
        emailPayload = getOfferLetterTemplate(candidateName, jobTitle, companyName, offerUrl);
      } else if (status === ApplicationStatus.REJECTED) {
        emailPayload = getRejectionTemplate(candidateName, jobTitle, companyName);
      } else if (status === ApplicationStatus.HIRED) {
        emailPayload = getWelcomeTemplate(candidateName, jobTitle, companyName);
      }

      if (emailPayload) {
        emailPayload.to = updated.candidate.email;
        emailPayload.tenantId = tenantId;
        await this.sesService.sendEmail(emailPayload);
      }
    } catch (err: any) {
      console.warn('Failed to send stage transition email notification:', err.message || err);
    }

    return updated;
  }

  async generateInterviewQuestions(id: string, focusTopic: string | undefined, tenantId: string) {
    const app = await this.findOne(id, tenantId);
    
    const summary = app.candidate.summary || '';
    const skills = app.candidate.skills || [];
    const jobDescription = app.job.description || '';

    const questions = await this.aiService.generateInterviewQuestions(
      summary,
      skills,
      jobDescription,
      focusTopic,
      tenantId
    );

    return questions;
  }

  async addNote(applicationId: string, authorId: string, message: string, isInternal: boolean, tenantId: string) {
    await this.findOne(applicationId, tenantId);
    return this.prisma.candidateNote.create({
      data: {
        tenantId,
        applicationId,
        authorId,
        message,
        isInternal: isInternal ?? true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async getNotes(applicationId: string, tenantId: string) {
    await this.findOne(applicationId, tenantId);
    return this.prisma.candidateNote.findMany({
      where: { applicationId, tenantId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
