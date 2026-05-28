import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LikeDto {
  @ApiProperty({ description: 'Type: like or favorite', enum: ['like', 'favorite'] })
  @IsEnum(['like', 'favorite'])
  type: 'like' | 'favorite';
}
