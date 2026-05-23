import { IsNotEmpty, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateRecycleBinDto {
  @IsNotEmpty()
  @IsInt()
  documentId: number;

  @IsOptional()
  @IsString()
  title?: string;
}
