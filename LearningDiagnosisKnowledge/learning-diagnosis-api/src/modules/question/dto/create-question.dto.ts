import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { QuestionType } from '../../../common/types';

export class KnowledgePointDto {
  @ApiProperty({ description: '知识点ID' })
  @IsInt()
  knowledgePointId: number;

  @ApiPropertyOptional({ description: '掌握等级', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  masteryLevel?: number;

  @ApiPropertyOptional({ description: '权重', default: 1.0 })
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ description: '是否主要知识点', default: 0 })
  @IsOptional()
  @IsInt()
  isPrimary?: number;
}

export class CreateQuestionDto {
  @ApiProperty({ description: '学科ID' })
  @IsInt()
  subjectId: number;

  @ApiProperty({ description: '题目类型', enum: QuestionType })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({ description: '难度 1-简单 2-中等 3-较难 4-困难' })
  @IsInt()
  @Min(1)
  @Max(4)
  difficulty: number;

  @ApiProperty({ description: '题目内容' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: '选项（选择题）' })
  @IsOptional()
  options?: any;

  @ApiProperty({ description: '答案' })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiPropertyOptional({ description: '解析' })
  @IsOptional()
  @IsString()
  analysis?: string;

  @ApiPropertyOptional({ description: '分数', default: 10.0 })
  @IsOptional()
  score?: number;

  @ApiPropertyOptional({ description: '预计时间（分钟）' })
  @IsOptional()
  @IsInt()
  estimatedTime?: number;

  @ApiPropertyOptional({ description: '来源' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: '关联知识点' })
  @IsOptional()
  knowledgePoints?: KnowledgePointDto[];
}
