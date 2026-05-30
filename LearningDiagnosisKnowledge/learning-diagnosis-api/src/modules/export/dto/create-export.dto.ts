import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsObject } from 'class-validator';
import { ExportType, ExportFormat } from '../../../common/types';

export class CreateExportDto {
  @ApiProperty({ description: '导出类型', enum: ExportType })
  @IsEnum(ExportType)
  type: ExportType;

  @ApiProperty({ description: '导出格式', enum: ExportFormat })
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @ApiPropertyOptional({ description: '学生ID（学生报告导出时需要）' })
  @IsOptional()
  @IsInt()
  studentId?: number;

  @ApiPropertyOptional({ description: '班级ID（班级报告导出时需要）' })
  @IsOptional()
  @IsInt()
  classId?: number;

  @ApiPropertyOptional({ description: '学科ID' })
  @IsOptional()
  @IsInt()
  subjectId?: number;

  @ApiPropertyOptional({ description: '导出参数（筛选条件等）' })
  @IsOptional()
  @IsObject()
  parameters?: any;
}
