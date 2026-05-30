import { IsNumber, IsOptional, IsObject } from 'class-validator';

export class UpdateMasteryDto {
  @IsNumber()
  @IsOptional()
  masteryLevel?: number;

  @IsNumber()
  @IsOptional()
  confidence?: number;

  @IsObject()
  @IsOptional()
  calculationDetails?: any;
}
