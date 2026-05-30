import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationParams, MasteryTrend } from '../../../common/types';

export class QueryMasteryDto implements PaginationParams {
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  pageSize?: number = 20;

  @IsNumber()
  @IsOptional()
  subjectId?: number;

  @IsNumber()
  @IsOptional()
  studentId?: number;

  @IsEnum(MasteryTrend)
  @IsOptional()
  masteryTrend?: MasteryTrend;

  @IsNumber()
  @IsOptional()
  minMasteryLevel?: number;

  @IsNumber()
  @IsOptional()
  maxMasteryLevel?: number;

  @IsString()
  @IsOptional()
  keyword?: string;
}
