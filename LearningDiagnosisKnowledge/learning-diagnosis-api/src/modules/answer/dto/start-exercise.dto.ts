import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class StartExerciseDto {
  @IsNumber()
  @IsNotEmpty()
  exerciseId: number;

  @IsNumber()
  @IsOptional()
  classId?: number;
}
