import { IsNotEmpty, IsInt, IsString, IsOptional } from 'class-validator';

export class CreateVersionDto {
  @IsNotEmpty()
  @IsInt()
  documentId: number;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  changeSummary?: string;
}
