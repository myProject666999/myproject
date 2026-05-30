import { IsString, IsNumber, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({ description: '班级名称', example: '高三(1)班' })
  @IsString()
  name: string;

  @ApiProperty({ description: '年级', example: '高三' })
  @IsString()
  grade: string;

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
}

export class AddStudentDto {
  @ApiProperty({ description: '学生ID列表', example: [1, 2, 3] })
  @IsNumber({}, { each: true })
  studentIds: number[];
}
