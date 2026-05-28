import { IsString, IsEmail, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Username' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username: string;

  @ApiProperty({ description: 'Password' })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiProperty({ description: 'Email' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Nickname' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nickname?: string;
}
