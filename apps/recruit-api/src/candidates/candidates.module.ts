import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';
import { S3Module } from '../s3/s3.module';

import { NotificationsModule } from '../notifications/notifications.module';
import { CustomFieldsModule } from '../custom-fields/custom-fields.module';

@Module({
  imports: [AuthModule, AiModule, S3Module, NotificationsModule, CustomFieldsModule],
  providers: [CandidatesService],
  controllers: [CandidatesController],
  exports: [CandidatesService],
})
export class CandidatesModule {}
