import { IsOptional, IsString, IsInt, IsEnum } from 'class-validator';

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  folderId?: number;

  @IsOptional()
  @IsInt()
  shareType?: number;
}
