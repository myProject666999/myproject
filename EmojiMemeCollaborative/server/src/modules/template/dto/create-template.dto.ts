import { IsString, IsOptional, IsNumber, IsArray, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Image URL' })
  @IsString()
  @MaxLength(500)
  image_url: string;

  @ApiPropertyOptional({ description: 'Category' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({ description: 'Tags' })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Width' })
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiPropertyOptional({ description: 'Height' })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({ description: 'Is official template' })
  @IsBoolean()
  @IsOptional()
  is_official?: boolean;

  @ApiPropertyOptional({ description: 'Copyright info' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  copyright_info?: string;
}
