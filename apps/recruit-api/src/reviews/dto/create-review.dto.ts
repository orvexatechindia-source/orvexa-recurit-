import { IsNotEmpty, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { RecommendationStatus } from '@prisma/client';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  applicationId!: string;

  @IsInt()
  @Min(1, { message: 'Rating must be at least 1 star.' })
  @Max(5, { message: 'Rating cannot exceed 5 stars.' })
  rating!: number;

  @IsEnum(RecommendationStatus, { message: 'Recommendation must be a valid option.' })
  recommendation!: RecommendationStatus;

  @IsString()
  @IsNotEmpty({ message: 'Feedback notes cannot be empty.' })
  notes!: string;
}
