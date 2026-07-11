import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { InterviewStatus } from '@prisma/client';
import { SesService } from '../notifications/ses.service';
import { getInterviewInvitationTemplate } from '@orvexa/notifications';

@Injectable()
export class InterviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sesService: SesService
  ) {}

  // 1. Schedule Interview
  async create(dto: CreateInterviewDto, tenantId: string) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (start >= end) {
      throw new BadRequestException('Interview end time must be after the start time.');
    }

    // Verify application exists and belongs to this tenant
    const app = await this.prisma.application.findUnique({
      where: { id: dto.applicationId },
      include: { candidate: true, job: true }
    });
    if (!app || app.tenantId !== tenantId) {
      throw new NotFoundException('Application not found inside this workspace.');
    }

    // Verify interviewer exists and belongs to this tenant
    const interviewer = await this.prisma.user.findUnique({
      where: { id: dto.interviewerId }
    });
    if (!interviewer || interviewer.tenantId !== tenantId) {
      throw new NotFoundException('Selected interviewer not found inside this workspace.');
    }

    // Auto-generate meeting link if none is provided
    let finalMeetingUrl = dto.meetingUrl;
    if (!finalMeetingUrl) {
      const code1 = Math.random().toString(36).substring(2, 5);
      const code2 = Math.random().toString(36).substring(2, 6);
      const code3 = Math.random().toString(36).substring(2, 5);
      finalMeetingUrl = `https://meet.google.com/${code1}-${code2}-${code3}`;
    }

    const interview = await this.prisma.interview.create({
      data: {
        tenantId,
        applicationId: dto.applicationId,
        interviewerId: dto.interviewerId,
        startTime: start,
        endTime: end,
        meetingUrl: finalMeetingUrl,
        status: InterviewStatus.SCHEDULED,
      },
      include: {
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        application: {
          include: {
            candidate: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Send interview invitation email alert to candidate
    try {
      const template = getInterviewInvitationTemplate(
        `${app.candidate.firstName} ${app.candidate.lastName}`,
        app.job.title,
        'Orvexatech',
        finalMeetingUrl
      );
      template.to = app.candidate.email;
      template.tenantId = tenantId;
      await this.sesService.sendEmail(template);
    } catch (err: any) {
      console.warn('Failed to send interview invitation email:', err.message || err);
    }

    console.log(`[INTERVIEW-SCHEDULED] Created interview ${interview.id} for candidate ${app.candidate.email}`);
    return interview;
  }

  // 2. Fetch all scheduled interviews for a tenant
  async findAll(tenantId: string) {
    return this.prisma.interview.findMany({
      where: { tenantId },
      include: {
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        application: {
          include: {
            candidate: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            job: {
              select: {
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  // 3. Cancel (delete) interview
  async remove(id: string, tenantId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found.');
    }

    if (interview.tenantId !== tenantId) {
      throw new ForbiddenException('You do not have access to cancel this interview.');
    }

    await this.prisma.interview.delete({
      where: { id },
    });

    console.log(`[INTERVIEW-CANCELLED] Cancelled interview ${id} in tenant ${tenantId}`);
    return { success: true, message: 'Interview cancelled successfully.' };
  }

  async findTeam(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
