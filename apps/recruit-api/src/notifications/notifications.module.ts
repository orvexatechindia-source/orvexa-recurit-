import { Module } from '@nestjs/common';
import { SesService } from './ses.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [NotificationsController],
  providers: [SesService],
  exports: [SesService],
})
export class NotificationsModule {}
