import { IsString, IsOptional, IsInt, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @Transform(({ value }) => value ?? 0)
  @Type(() => Number)
  @IsInt()
  folderId?: number;
}
