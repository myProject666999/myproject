import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';

export class SubmitAnswerDto {
  @IsNumber()
  @IsNotEmpty()
  questionId: number;

  @IsNumber()
  @IsOptional()
  exerciseId?: number;

  @IsNumber()
  @IsOptional()
  sessionId?: number;

  @IsString()
  @IsOptional()
  studentAnswer?: string;

  @IsNumber()
  @IsOptional()
  timeSpent?: number;

  @IsOptional()
  startTime?: Date;

  @IsObject()
  @IsOptional()
  answerMetadata?: Record<string, any>;
}
