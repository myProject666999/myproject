import { IsEnum, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewActionDto {
  @ApiProperty({ description: 'Review action', enum: ['approve', 'reject'] })
  @IsEnum(['approve', 'reject'])
  action: 'approve' | 'reject';

  @ApiPropertyOptional({ description: 'Reason for rejection' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
