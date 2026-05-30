import { IsNumber, IsOptional, IsEnum, IsArray } from 'class-validator';
import { RecommendationType } from '../../../common/types';

export class CreateRecommendationDto {
  @IsNumber()
  subjectId: number;

  @IsEnum(RecommendationType)
  @IsOptional()
  type?: RecommendationType;

  @IsNumber()
  @IsOptional()
  totalQuestions?: number = 10;

  @IsArray()
  @IsOptional()
  knowledgePointIds?: number[];
}
