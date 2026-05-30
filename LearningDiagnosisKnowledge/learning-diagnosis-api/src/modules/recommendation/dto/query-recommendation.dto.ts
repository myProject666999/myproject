import { IsNumber, IsOptional, IsEnum } from 'class-validator';
import { PaginationParams, RecommendationType } from '../../../common/types';

export class QueryRecommendationDto implements PaginationParams {
  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  pageSize?: number = 20;

  @IsNumber()
  @IsOptional()
  subjectId?: number;

  @IsEnum(RecommendationType)
  @IsOptional()
  type?: RecommendationType;

  @IsNumber()
  @IsOptional()
  isCompleted?: number;
}
