import { IsNumber, IsOptional, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ClassComparisonDto {
  @ApiProperty({ description: '要对比的班级ID列表', example: [1, 2, 3] })
  @IsNumber({}, { each: true })
  classIds: number[];

  @ApiPropertyOptional({ description: '学科ID，不传则对比所有学科', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  subjectId?: number;

  @ApiPropertyOptional({ description: '统计开始日期', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '统计结束日期', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class ClassTrendComparisonDto {
  @ApiProperty({ description: '要对比的班级ID列表', example: [1, 2, 3] })
  @IsNumber({}, { each: true })
  classIds: number[];

  @ApiPropertyOptional({ description: '学科ID', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  subjectId?: number;

  @ApiPropertyOptional({ description: '统计天数，默认30天', example: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  days?: number;
}
