import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Submit review scorecard
  async create(dto: CreateReviewDto, interviewerId: string, tenantId: string) {
    // Verify application belongs to this tenant
    const app = await this.prisma.application.findUnique({
      where: { id: dto.applicationId },
      include: { candidate: true }
    });

    if (!app || app.tenantId !== tenantId) {
      throw new NotFoundException('Application not found inside this workspace.');
    }

    const review = await this.prisma.review.create({
      data: {
        tenantId,
        applicationId: dto.applicationId,
        interviewerId,
        rating: dto.rating,
        recommendation: dto.recommendation,
        notes: dto.notes,
      },
      include: {
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`[SCORECARD-SUBMITTED] Interviewer ${interviewerId} scored candidate ${app.candidate.email} as ${dto.rating} stars`);
    return review;
  }

  // 2. Get reviews by application ID
  async findAllForApplication(applicationId: string, tenantId: string) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!app || app.tenantId !== tenantId) {
      throw new NotFoundException('Application not found.');
    }

    return this.prisma.review.findMany({
      where: { applicationId, tenantId },
      include: {
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.review.findMany({
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
                lastName: true,
                email: true
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
        createdAt: 'desc'
      }
    });
  }

  async exportReviewsCsv(tenantId: string): Promise<string> {
    const reviews = await this.findAll(tenantId);
    const headers = ['Review ID', 'Candidate Name', 'Candidate Email', 'Job Title', 'Rating', 'Recommendation', 'Interviewer Name', 'Interviewer Email', 'Notes', 'Created At'];
    const rows = reviews.map(r => [
      r.id,
      `"${((r.application?.candidate?.firstName || '') + ' ' + (r.application?.candidate?.lastName || '')).replace(/"/g, '""')}"`,
      `"${(r.application?.candidate?.email || '').replace(/"/g, '""')}"`,
      `"${(r.application?.job?.title || '').replace(/"/g, '""')}"`,
      r.rating,
      r.recommendation,
      `"${(r.interviewer?.name || '').replace(/"/g, '""')}"`,
      `"${(r.interviewer?.email || '').replace(/"/g, '""')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
      new Date(r.createdAt).toISOString()
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}

