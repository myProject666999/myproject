import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const isMatch = await this.validatePassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };
    const access_token = this.jwtService.sign(payload);
    return {
      access_token,
      userId: user.id,
      username: user.username,
      email: user.email,
    };
  }

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }
    const existingEmail = await this.usersService.findByEmail(email);
    if (existingEmail) {
      throw new BadRequestException('邮箱已被注册');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      username,
      email,
      password: hashedPassword,
    });
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };
    const access_token = this.jwtService.sign(payload);
    return {
      access_token,
      userId: user.id,
      username: user.username,
      email: user.email,
    };
  }
}
