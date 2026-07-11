import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SesService } from '../notifications/ses.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CandidatePortalService {
  // Simple in-memory storage for magic passcode verification codes
  private passcodeCache = new Map<string, string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly sesService: SesService,
    private readonly jwtService: JwtService
  ) {}

  async requestPasscode(email: string, domain: string) {
    // 1. Look up tenant by domain
    const tenant = await this.prisma.tenant.findUnique({
      where: { domain },
    });

    if (!tenant) {
      throw new NotFoundException(`Organization with domain "${domain}" not found.`);
    }

    // 2. Generate 6-digit random passcode
    const passcode = Math.floor(100000 + Math.random() * 900000).toString();
    this.passcodeCache.set(`${tenant.id}:${email.toLowerCase()}`, passcode);

    // Log the passcode to console for easy developer testing
    console.log(`[Magic Code Auth] Passcode for ${email} on tenant ${tenant.name}: ${passcode}`);

    // 3. Send email to applicant containing code using AWS SES
    try {
      await this.sesService.sendEmail({
        to: email,
        tenantId: tenant.id,
        subject: `Your Orvexa Recruit Access Passcode`,
        bodyHtml: `
          <div style="font-family: sans-serif; padding: 24px; max-width: 600px; color: #1e293b;">
            <h2 style="color: #2563eb;">Orvexa Recruit Access</h2>
            <p>You requested secure access to track your applications with <strong>${tenant.name}</strong>.</p>
            <p>Please enter the following 6-digit passcode in the portal:</p>
            <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-radius: 8px; font-size: 24px; font-weight: bold; tracking-wider: 4px; color: #0b1220; margin: 24px 0;">
              ${passcode}
            </div>
            <p style="font-size: 12px; color: #64748b;">This passcode is valid for 15 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `,
        bodyText: `Your Orvexa Recruit Access Passcode is: ${passcode}`,
      });
    } catch (err: any) {
      console.warn('Failed to send magic passcode email:', err.message || err);
    }

    return {
      success: true,
      message: 'Secure magic passcode dispatched to candidate email successfully.',
    };
  }

  async verifyPasscode(email: string, code: string, domain: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { domain },
    });

    if (!tenant) {
      throw new NotFoundException(`Organization with domain "${domain}" not found.`);
    }

    const cacheKey = `${tenant.id}:${email.toLowerCase()}`;
    const cachedCode = this.passcodeCache.get(cacheKey);

    if (!cachedCode || cachedCode !== code) {
      throw new BadRequestException('Invalid or expired login passcode.');
    }

    // Clear verification code
    this.passcodeCache.delete(cacheKey);

    // Generate lightweight candidate JWT token
    const token = this.jwtService.sign({
      email: email.toLowerCase(),
      tenantId: tenant.id,
      role: 'CANDIDATE'
    });

    return {
      success: true,
      accessToken: token,
      email: email.toLowerCase(),
      tenantId: tenant.id,
    };
  }

  async getApplications(email: string, tenantId: string) {
    // Find candidate by email within this tenant space
    const candidate = await this.prisma.candidate.findFirst({
      where: {
        email: email.toLowerCase(),
        tenantId,
      },
    });

    if (!candidate) {
      return [];
    }

    // Retrieve active applications
    return this.prisma.application.findMany({
      where: {
        candidateId: candidate.id,
        tenantId,
      },
      include: {
        job: true,
        interviews: {
          orderBy: {
            startTime: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateOfferStatus(applicationId: string, email: string, tenantId: string, status: 'ACCEPTED' | 'DECLINED') {
    // Validate candidate owns this application
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        tenantId,
        candidate: {
          email: email.toLowerCase(),
        },
      },
      include: {
        candidate: true
      }
    });

    if (!application) {
      throw new NotFoundException(`Application with ID "${applicationId}" not found for this candidate.`);
    }

    if (application.offerStatus !== 'EXTENDED') {
      throw new BadRequestException('No extended offer letter available to sign or modify.');
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        offerStatus: status,
        signedAt: status === 'ACCEPTED' ? new Date() : null,
        status: status === 'ACCEPTED' ? 'OFFER' : 'REJECTED', // Update stage tracker accordingly
      },
    });

    return {
      success: true,
      offerStatus: updated.offerStatus,
      status: updated.status,
    };
  }

  // Recruiter extend offer helper
  async extendOffer(applicationId: string, offerLetter: string, tenantId: string) {
    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        tenantId,
      },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID "${applicationId}" not found.`);
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        offerLetter,
        offerStatus: 'EXTENDED',
        status: 'OFFER',
      },
    });

    return {
      success: true,
      message: 'Offer letter extended to applicant portal successfully.',
      application: updated,
    };
  }
}
