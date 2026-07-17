import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../auth/guards/rbac.guard';
import { PrismaService } from '../prisma/prisma.service';
import { createSuccessResponse } from '@orvexa/shared';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getNotifications(@Request() req: any) {
    const tenantId = req.tenantId;

    const logs = await this.prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { timestamp: 'desc' },
      take: 15,
    });

    return createSuccessResponse(logs);
  }
}
