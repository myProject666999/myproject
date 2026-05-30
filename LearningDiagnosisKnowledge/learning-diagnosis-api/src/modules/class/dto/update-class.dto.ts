import { IsString, IsNumber, IsOptional, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateClassDto {
  @ApiPropertyOptional({ description: '班级名称', example: '高三(1)班' })
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

  @ApiPropertyOptional({ description: '授课教师ID', example: 1 })
  @IsOptional()
  @IsNumber()
  teacherId?: number;

  @ApiPropertyOptional({ description: '班级描述', example: '理科实验班' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '状态 1-正常 0-禁用', example: 1 })
  @IsOptional()
  @IsInt()
  status?: number;
}
