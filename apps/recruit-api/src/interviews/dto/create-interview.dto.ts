import { IsNotEmpty, IsString, IsDateString, IsOptional, IsUrl } from 'class-validator';

export class CreateInterviewDto {
  @IsString()
  @IsNotEmpty()
  applicationId!: string;

  @IsString()
  @IsNotEmpty()
  interviewerId!: string;

  @IsDateString()
  @IsNotEmpty()
  startTime!: string;

  @IsDateString()
  @IsNotEmpty()
  endTime!: string;

  @IsString()
  @IsOptional()
  @IsUrl({}, { message: 'Meeting URL must be a valid web link.' })
  meetingUrl?: string;
}
