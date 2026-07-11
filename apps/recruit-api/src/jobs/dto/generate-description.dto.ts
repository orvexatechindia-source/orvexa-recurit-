import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class GenerateDescriptionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Outline prompt must be at least 5 characters long.' })
  outline!: string;
}
