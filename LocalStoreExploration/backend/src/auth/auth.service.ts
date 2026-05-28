import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(username: string, password: string, nickname: string) {
    const existingUser = await this.userRepository.findOne({ where: { username } });
    if (existingUser) {
      throw new UnauthorizedException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      nickname,
    });
    await this.userRepository.save(user);

    const token = this.jwtService.sign({ userId: user.id });
    return { token, user: this.sanitizeUser(user) };
  }

  async login(username: string, password: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const token = this.jwtService.sign({ userId: user.id });
    return { token, user: this.sanitizeUser(user) };
  }

  private sanitizeUser(user: User) {
    const { password, ...result } = user;
    return result;
  }
}
