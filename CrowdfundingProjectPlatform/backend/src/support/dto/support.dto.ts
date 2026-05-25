import { IsNotEmpty, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SupportDto {
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  projectId: number;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  tierId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  remark?: string;
}
