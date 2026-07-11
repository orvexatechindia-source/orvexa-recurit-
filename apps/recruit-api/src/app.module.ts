import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { JobsModule } from './jobs/jobs.module';
import { CandidatesModule } from './candidates/candidates.module';
import { ApplicationsModule } from './applications/applications.module';
import { AiModule } from './ai/ai.module';
import { S3Module } from './s3/s3.module';
import { InterviewsModule } from './interviews/interviews.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

@Module({
  imports: [PrismaModule, AuthModule, OnboardingModule, JobsModule, CandidatesModule, ApplicationsModule, AiModule, S3Module, InterviewsModule, ReviewsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply Multi-Tenancy extraction middleware globally across all routes
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*');
  }
}
