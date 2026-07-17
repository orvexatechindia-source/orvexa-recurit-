import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplyJobDto } from './dto/candidates.dto';
import { ApplicationStatus } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { S3Service } from '../s3/s3.service';
import { SesService } from '../notifications/ses.service';
import { CustomFieldsService } from '../custom-fields/custom-fields.service';
import { getApplicationConfirmationTemplate } from '@orvexa/notifications';
import * as fs from 'fs';

@Injectable()
export class CandidatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly s3Service: S3Service,
    private readonly sesService: SesService,
    private readonly customFieldsService: CustomFieldsService
  ) {}

  async apply(dto: ApplyJobDto, file: any, tenantId: string) {
    // 1. Verify that the target Job exists and is active inside this tenant
    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId },
    });

    if (!job) {
      throw new NotFoundException(`Target Job opening with ID "${dto.jobId}" not found.`);
    }

    if (job.tenantId !== tenantId) {
      throw new BadRequestException('Workspace mismatched: Job posting does not belong to this tenant.');
    }

    // Parse the resume asynchronously with Google Gemini AI
    let parsedResult = {
      summary: null as string | null,
      skills: [] as string[],
      matchScore: null as number | null,
      fitExplanation: null as string | null,
      suggestedQuestions: [] as string[],
    };

    try {
      const fileBuffer = fs.readFileSync(file.path);
      const aiResponse = await this.aiService.parseResume(
        fileBuffer,
        file.mimetype,
        job.description,
        tenantId
      );
      parsedResult = {
        summary: aiResponse.summary,
        skills: aiResponse.skills,
        matchScore: aiResponse.matchScore,
        fitExplanation: aiResponse.fitExplanation,
        suggestedQuestions: aiResponse.suggestedQuestions,
      };
    } catch (err: any) {
      console.error('Error reading/parsing resume file:', err.message || err);
    }

    // Upload candidate resume to AWS S3 (falls back to local filesystem static routes if AWS config is mock)
    const fileBuffer = fs.readFileSync(file.path);
    const resumeUrl = await this.s3Service.uploadFile(file.filename, fileBuffer, file.mimetype);

    // 2. Find or Upsert Candidate based on (tenantId, email)
    const candidate = await this.prisma.candidate.upsert({
      where: {
        tenantId_email: {
          tenantId,
          email: dto.email,
        },
      },
      update: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        resumeUrl, // Overwrite resume with latest upload
        skills: parsedResult.skills,
        summary: parsedResult.summary,
      },
      create: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        resumeUrl,
        skills: parsedResult.skills,
        summary: parsedResult.summary,
        tenantId,
      },
    });

    // 3. Prevent duplicate active applications for the same Job posting
    const existingApp = await this.prisma.application.findFirst({
      where: {
        candidateId: candidate.id,
        jobId: dto.jobId,
      },
    });

    if (existingApp) {
      throw new BadRequestException('You have already applied for this job opening.');
    }

    // 4. Create Job Application linkage record with AI scores
    const application = await this.prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobId: dto.jobId,
        status: ApplicationStatus.APPLIED,
        matchScore: parsedResult.matchScore,
        fitExplanation: parsedResult.fitExplanation,
        suggestedQuestions: parsedResult.suggestedQuestions,
        tenantId,
      },
      include: {
        candidate: true,
        job: true,
      },
    });

    try {
      await this.prisma.auditLog.create({
        data: {
          tenantId,
          action: 'APPLY_JOB',
          entityName: 'Application',
          entityId: application.id,
          metadata: {
            candidateName: `${candidate.firstName} ${candidate.lastName}`,
            jobTitle: application.job.title,
            matchScore: parsedResult.matchScore,
          },
        },
      });
    } catch (err: any) {
      console.warn('Failed to create APPLY_JOB audit log:', err.message || err);
    }

    // Save Candidate custom values if provided
    if (dto.customValues) {
      try {
        const valuesMap = JSON.parse(dto.customValues);
        await this.customFieldsService.saveValues({
          entityId: candidate.id,
          values: valuesMap
        }, tenantId);
      } catch (err: any) {
        console.warn('Failed to parse or save candidate custom values:', err.message || err);
      }
    }

    // Send application confirmation email alert
    try {
      const template = getApplicationConfirmationTemplate(
        `${candidate.firstName} ${candidate.lastName}`,
        application.job.title,
        'Orvexatech'
      );
      template.to = candidate.email;
      template.tenantId = tenantId;
      await this.sesService.sendEmail(template);
    } catch (err: any) {
      console.warn('Failed to send application confirmation email:', err.message || err);
    }

    return {
      message: 'Application submitted successfully.',
      applicationId: application.id,
      candidateId: candidate.id,
      matchScore: parsedResult.matchScore,
    };
  }

  async findAll(tenantId: string) {
    return this.findAllFiltered(tenantId, {});
  }

  async findAllFiltered(
    tenantId: string,
    filters: { query?: string; skills?: string; minMatchScore?: number; jobId?: string }
  ) {
    const { query, skills, minMatchScore, jobId } = filters;

    const whereClause: any = { tenantId };

    if (query && query.trim()) {
      const q = query.trim();
      whereClause.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (skills && skills.trim()) {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsArray.length > 0) {
        whereClause.skills = {
          hasSome: skillsArray
        };
      }
    }

    if (jobId || minMatchScore !== undefined) {
      whereClause.applications = {
        some: {
          ...(jobId ? { jobId } : {}),
          ...(minMatchScore !== undefined ? { matchScore: { gte: minMatchScore } } : {})
        }
      };
    }

    const candidates = await this.prisma.candidate.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        applications: {
          include: {
            job: {
              select: { title: true },
            },
          },
        },
      },
    });

    const candidateIds = candidates.map(c => c.id);
    const customValues = await this.prisma.customValue.findMany({
      where: {
        tenantId,
        entityId: { in: candidateIds }
      },
      include: {
        field: true
      }
    });

    return candidates.map(candidate => {
      const values = customValues.filter(v => v.entityId === candidate.id);
      return {
        ...candidate,
        customValues: values
      };
    });
  }

  async remove(id: string, tenantId: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id },
    });

    if (!candidate || candidate.tenantId !== tenantId) {
      throw new NotFoundException(`Candidate profile with ID "${id}" not found.`);
    }

    // Delete candidate profile (Prisma cascade onDelete deletes applications)
    await this.prisma.candidate.delete({
      where: { id },
    });

    return { success: true, message: 'Candidate profile and all associated data deleted for compliance.' };
  }
}
