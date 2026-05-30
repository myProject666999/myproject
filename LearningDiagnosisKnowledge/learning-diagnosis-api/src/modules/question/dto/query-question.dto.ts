import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { QuestionType } from '../../../common/types';

export class QueryQuestionDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @IsInt()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  @IsInt()
  pageSize?: number;

  @ApiPropertyOptional({ description: '学科ID' })
  @IsOptional()
  @IsInt()
  subjectId?: number;

  @ApiPropertyOptional({ description: '题目类型', enum: QuestionType })
  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @ApiPropertyOptional({ description: '难度 1-简单 2-中等 3-较难 4-困难' })
  @IsOptional()
  @IsInt()
  difficulty?: number;

  @ApiPropertyOptional({ description: '知识点ID' })
  @IsOptional()
  @IsInt()
  knowledgePointId?: number;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '状态 0-禁用 1-启用' })
  @IsOptional()
  @IsInt()
  status?: number;
}
