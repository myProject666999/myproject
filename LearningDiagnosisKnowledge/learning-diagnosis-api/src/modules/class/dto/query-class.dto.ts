import { IsOptional, IsNumber, IsInt, Min, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryClassDto {
  @ApiPropertyOptional({ description: '班级名称模糊搜索', example: '高三' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '年级', example: '高三' })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({ description: '学科', example: '数学' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ description: '教师ID', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  teacherId?: number;

  @ApiPropertyOptional({ description: '状态 1-正常 0-禁用', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  status?: number;

  @ApiPropertyOptional({ description: '页码', example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', example: 20, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}
