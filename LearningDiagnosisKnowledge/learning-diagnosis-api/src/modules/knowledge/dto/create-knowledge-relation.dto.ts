import {
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KnowledgeRelationType } from '../../../common/types';

export class CreateKnowledgeRelationDto {
  @ApiProperty({ description: '源知识点ID', example: 1 })
  @IsNumber()
  fromKpId: number;

  @ApiProperty({ description: '目标知识点ID', example: 2 })
  @IsNumber()
  toKpId: number;

  @ApiProperty({
    description: '关系类型',
    enum: KnowledgeRelationType,
    example: KnowledgeRelationType.PREREQUISITE,
  })
  @IsEnum(KnowledgeRelationType)
  relationType: KnowledgeRelationType;

  @ApiPropertyOptional({
    description: '权重 0-1',
    example: 0.8,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  weight?: number;

  @ApiPropertyOptional({
    description: '关系描述',
    example: '学习方程前需要先掌握代数式',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
