import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateKnowledgePointDto {
  @ApiProperty({ description: '学科ID', example: 1 })
  @IsNumber()
  subjectId: number;

  @ApiPropertyOptional({ description: '父节点ID', example: null })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ description: '知识点名称', example: '一元一次方程' })
  @IsString()
  name: string;

  @ApiProperty({ description: '知识点编码', example: 'MATH-ALG-001' })
  @IsString()
  code: string;

  @ApiPropertyOptional({
    description: '知识点描述',
    example: '含有一个未知数，且未知数次数为1的整式方程',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: '难度等级 1-5',
    example: 2,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  difficultyLevel?: number;

  @ApiPropertyOptional({
    description: '重要程度 1-5',
    example: 3,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  importanceLevel?: number;

  @ApiPropertyOptional({ description: '排序号', example: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
