import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number;
}
