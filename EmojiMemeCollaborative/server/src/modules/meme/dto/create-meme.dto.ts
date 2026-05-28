import { IsString, IsOptional, IsNumber, IsObject, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMemeDto {
  @ApiProperty({ description: 'Meme title' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'Template ID' })
  @IsNumber()
  @IsOptional()
  template_id?: number;

  @ApiPropertyOptional({ description: 'Canvas data with layers' })
  @IsObject()
  @IsOptional()
  canvas_data?: any;
}
