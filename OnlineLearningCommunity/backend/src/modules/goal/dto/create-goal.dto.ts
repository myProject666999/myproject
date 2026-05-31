import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsEnum, IsDateString } from 'class-validator';

export class CreateGoalDto {
  @IsInt()
  @IsNotEmpty({ message: '小组ID不能为空' })
  groupId: number;

  @IsString()
  @IsNotEmpty({ message: '目标标题不能为空' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1, { message: '目标值必须大于0' })
  targetValue: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
