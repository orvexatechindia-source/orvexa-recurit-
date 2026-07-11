import { IsNotEmpty, IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { CustomFieldEntityType, CustomFieldType } from '@prisma/client';

export class CreateCustomFieldDto {
  @IsEnum(CustomFieldEntityType, { message: 'Entity type must be JOB or CANDIDATE.' })
  entityType!: CustomFieldEntityType;

  @IsString()
  @IsNotEmpty({ message: 'Field name is required.' })
  fieldName!: string;

  @IsEnum(CustomFieldType, { message: 'Field type must be TEXT, NUMBER, BOOLEAN, or DROPDOWN.' })
  fieldType!: CustomFieldType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];
}

export class SaveCustomValuesDto {
  @IsString()
  @IsNotEmpty()
  entityId!: string;

  @IsNotEmpty()
  values!: Record<string, string>; // Maps fieldId -> stringified value
}
