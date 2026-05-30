import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: '原密码', example: '123456' })
  @IsString({ message: '原密码必须是字符串' })
  @IsNotEmpty({ message: '原密码不能为空' })
  oldPassword: string;

  @ApiProperty({ description: '新密码', example: '654321' })
  @IsString({ message: '新密码必须是字符串' })
  @IsNotEmpty({ message: '新密码不能为空' })
  @MinLength(6, { message: '新密码长度不能少于6位' })
  newPassword: string;
}
