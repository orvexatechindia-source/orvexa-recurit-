import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomFieldDto, SaveCustomValuesDto } from './dto/custom-fields.dto';
import { CustomFieldEntityType } from '@prisma/client';

@Injectable()
export class CustomFieldsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Create a dynamic custom field
  async createField(dto: CreateCustomFieldDto, tenantId: string) {
    // Prevent duplicate field names for the same entity type inside the workspace
    const existing = await this.prisma.customField.findFirst({
      where: {
        tenantId,
        entityType: dto.entityType,
        fieldName: { equals: dto.fieldName, mode: 'insensitive' }
      }
    });

    if (existing) {
      throw new BadRequestException(`Field name "${dto.fieldName}" already exists on ${dto.entityType.toLowerCase()} profiles.`);
    }

    return this.prisma.customField.create({
      data: {
        tenantId,
        entityType: dto.entityType,
        fieldName: dto.fieldName,
        fieldType: dto.fieldType,
        options: dto.options || []
      }
    });
  }

  // 2. Fetch custom field configurations
  async getFields(tenantId: string, entityType?: CustomFieldEntityType) {
    return this.prisma.customField.findMany({
      where: {
        tenantId,
        ...(entityType ? { entityType } : {})
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  // 3. Save dynamic values for an entity
  async saveValues(dto: SaveCustomValuesDto, tenantId: string) {
    const results = [];
    
    for (const [fieldId, value] of Object.entries(dto.values)) {
      // Validate that the field exists and belongs to this tenant
      const field = await this.prisma.customField.findUnique({
        where: { id: fieldId }
      });

      if (!field || field.tenantId !== tenantId) {
        throw new NotFoundException(`Custom field definition not found in this workspace.`);
      }

      // Upsert value link
      const existing = await this.prisma.customValue.findFirst({
        where: {
          tenantId,
          entityId: dto.entityId,
          fieldId
        }
      });

      let record;
      if (existing) {
        record = await this.prisma.customValue.update({
          where: { id: existing.id },
          data: { value: String(value) }
        });
      } else {
        record = await this.prisma.customValue.create({
          data: {
            tenantId,
            entityId: dto.entityId,
            fieldId,
            value: String(value)
          }
        });
      }
      results.push(record);
    }

    return results;
  }

  // 4. Get dynamic values for an entity
  async getValues(entityId: string, tenantId: string) {
    return this.prisma.customValue.findMany({
      where: {
        tenantId,
        entityId
      },
      include: {
        field: true
      }
    });
  }
}
