import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationParams } from '../../../common/types';

export class QueryAnswerDto implements PaginationParams {
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  pageSize?: number = 20;

  @IsNumber()
  @IsOptional()
  subjectId?: number;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsNumber()
  @IsOptional()
  isCorrect?: number;

  @IsNumber()
  @IsOptional()
  exerciseId?: number;
}
