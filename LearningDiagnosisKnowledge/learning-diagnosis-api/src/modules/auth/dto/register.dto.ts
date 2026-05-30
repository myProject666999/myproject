import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: '用户名', example: 'student1' })
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @MinLength(4, { message: '用户名长度不能少于4位' })
  @MaxLength(50, { message: '用户名长度不能超过50位' })
  username: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string;

  @ApiProperty({ description: '真实姓名', example: '张三' })
  @IsString({ message: '真实姓名必须是字符串' })
  @IsNotEmpty({ message: '真实姓名不能为空' })
  @MaxLength(50, { message: '真实姓名长度不能超过50位' })
  realName: string;
}
