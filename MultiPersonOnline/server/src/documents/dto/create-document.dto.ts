import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  folderId?: number;
}
