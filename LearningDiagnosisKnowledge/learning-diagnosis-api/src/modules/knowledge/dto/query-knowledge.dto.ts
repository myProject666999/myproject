import { IsOptional, IsNumber, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryKnowledgeDto {
  @ApiPropertyOptional({ description: '学科ID', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  subjectId?: number;

  @ApiPropertyOptional({ description: '父节点ID', example: null })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parentId?: number;

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
