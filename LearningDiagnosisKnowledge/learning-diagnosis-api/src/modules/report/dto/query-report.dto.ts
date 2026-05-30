import { IsNumber, IsOptional, IsEnum, IsString } from 'class-validator';
import { PaginationParams, ReportType } from '../../../common/types';

export class QueryReportDto implements PaginationParams {
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  pageSize?: number = 20;

  @IsEnum(ReportType)
  @IsOptional()
  type?: ReportType;

  @IsNumber()
  @IsOptional()
  studentId?: number;

  @IsNumber()
  @IsOptional()
  classId?: number;

  @IsNumber()
  @IsOptional()
  subjectId?: number;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;
}
