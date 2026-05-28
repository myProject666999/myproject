import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryMemeDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', default: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsString()
  @IsOptional()
  keyword?: string;

  @ApiPropertyOptional({ description: 'Template ID filter' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  template_id?: number;

  @ApiPropertyOptional({ description: 'Creator ID filter' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  created_by?: number;

  @ApiPropertyOptional({ description: 'Status filter', enum: ['approved', 'pending', 'rejected'] })
  @IsEnum(['approved', 'pending', 'rejected'])
  @IsOptional()
  status?: string;
}
