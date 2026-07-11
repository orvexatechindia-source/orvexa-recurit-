import { Module } from '@nestjs/common';
import { CandidatePortalService } from './candidate-portal.service';
import { CandidatePortalController } from './candidate-portal.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, PrismaModule, NotificationsModule],
  providers: [CandidatePortalService],
  controllers: [CandidatePortalController],
  exports: [CandidatePortalService],
})
export class CandidatePortalModule {}
