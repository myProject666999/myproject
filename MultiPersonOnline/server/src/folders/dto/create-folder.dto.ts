import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @Transform(({ value }) => value ?? 0)
  @Type(() => Number)
  @IsInt()
  parentId?: number;
}
