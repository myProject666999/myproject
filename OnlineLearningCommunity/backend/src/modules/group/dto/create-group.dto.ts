import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty({ message: '小组名称不能为空' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(200)
  maxMembers?: number;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}
