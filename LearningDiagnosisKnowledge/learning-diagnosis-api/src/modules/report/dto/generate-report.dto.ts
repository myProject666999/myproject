import { IsNotEmpty, IsNumber, IsOptional, IsEnum, IsString, IsArray, IsDateString } from 'class-validator';
import { ReportType } from '../../../common/types';

export class GenerateReportDto {
  @IsEnum(ReportType)
  @IsNotEmpty()
  type: ReportType;

  @IsNumber()
  @IsOptional()
  studentId?: number;

  @IsNumber()
  @IsOptional()
  classId?: number;

  @IsArray()
  @IsOptional()
  comparisonClassIds?: number[];

  @IsNumber()
  @IsNotEmpty()
  subjectId: number;

  @IsDateString()
  @IsOptional()
  periodStart?: string;

  @IsDateString()
  @IsOptional()
  periodEnd?: string;

  @IsString()
  @IsOptional()
  periodType?: 'week' | 'month';

  @IsString()
  @IsOptional()
  title?: string;
}
