import { IsOptional, IsString } from 'class-validator';

export class UpdateFolderDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  parentId?: number;

  @IsOptional()
  sortOrder?: number;
}
