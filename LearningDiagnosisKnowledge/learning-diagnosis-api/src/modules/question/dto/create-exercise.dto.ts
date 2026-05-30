import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ExerciseType } from '../../../common/types';

export class ExerciseQuestionDto {
  @ApiProperty({ description: '题目ID' })
  @IsInt()
  questionId: number;

  @ApiProperty({ description: '分数' })
  score: number;

  @ApiPropertyOptional({ description: '排序', default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class CreateExerciseDto {
  @ApiProperty({ description: '练习名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '学科ID' })
  @IsInt()
  subjectId: number;

  @ApiProperty({ description: '练习类型', enum: ExerciseType })
  @IsEnum(ExerciseType)
  type: ExerciseType;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '总分', default: 100.0 })
  @IsOptional()
  totalScore?: number;

  @ApiPropertyOptional({ description: '时间限制（分钟）' })
  @IsOptional()
  @IsInt()
  timeLimit?: number;

  @ApiPropertyOptional({ description: '是否公开', default: 0 })
  @IsOptional()
  @IsInt()
  isPublic?: number;

  @ApiPropertyOptional({ description: '题目列表' })
  @IsOptional()
  questions?: ExerciseQuestionDto[];
}

export class UpdateExerciseDto {
  @ApiPropertyOptional({ description: '练习名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '学科ID' })
  @IsOptional()
  @IsInt()
  subjectId?: number;

  @ApiPropertyOptional({ description: '练习类型', enum: ExerciseType })
  @IsOptional()
  @IsEnum(ExerciseType)
  type?: ExerciseType;

  @ApiPropertyOptional({ description: '描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '总分' })
  @IsOptional()
  totalScore?: number;

  @ApiPropertyOptional({ description: '时间限制（分钟）' })
  @IsOptional()
  @IsInt()
  timeLimit?: number;

  @ApiPropertyOptional({ description: '是否公开' })
  @IsOptional()
  @IsInt()
  isPublic?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsInt()
  status?: number;
}

export class QueryExerciseDto {
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

  @ApiPropertyOptional({ description: '练习类型', enum: ExerciseType })
  @IsOptional()
  @IsEnum(ExerciseType)
  type?: ExerciseType;

  @ApiPropertyOptional({ description: '创建者ID' })
  @IsOptional()
  @IsInt()
  creatorId?: number;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '是否公开' })
  @IsOptional()
  @IsInt()
  isPublic?: number;

  @ApiPropertyOptional({ description: '状态' })
  @IsOptional()
  @IsInt()
  status?: number;
}
