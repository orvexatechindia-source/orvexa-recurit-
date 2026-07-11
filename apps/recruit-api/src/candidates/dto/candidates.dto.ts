import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class ApplyJobDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  jobId!: string;

  @IsString()
  @IsOptional()
  customValues?: string;
}
