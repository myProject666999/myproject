import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsEnum } from 'class-validator';

export class CreateCheckinDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  studyMinutes?: number;

  @IsOptional()
  @IsEnum(['happy', 'neutral', 'tired', 'motivated'])
  mood?: string;
}
