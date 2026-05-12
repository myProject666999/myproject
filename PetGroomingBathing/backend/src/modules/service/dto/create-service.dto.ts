import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  duration: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  applicableBreeds?: string;

  @IsNumber()
  @IsOptional()
  minWeight?: number;

  @IsNumber()
  @IsOptional()
  maxWeight?: number;
}
