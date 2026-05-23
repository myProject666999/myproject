import { IsOptional, IsString } from 'class-validator';

export class UpdateVersionDto {
  @IsOptional()
  @IsString()
  changeSummary?: string;
}
