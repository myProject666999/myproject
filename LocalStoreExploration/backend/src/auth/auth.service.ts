import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { instanceToPlain } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
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
    try {
      this.logger.log(`Login attempt for user: ${username}`);
      const user = await this.userRepository.findOne({ where: { username } });
      this.logger.log(`Found user: ${user ? user.id : 'null'}`);
      
      if (!user) {
        throw new UnauthorizedException('用户名或密码错误');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      this.logger.log(`Password valid: ${isPasswordValid}`);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('用户名或密码错误');
      }

      const token = this.jwtService.sign({ userId: user.id });
      return { token, user: this.sanitizeUser(user) };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`, error.stack);
      throw error;
    }
  }

  private sanitizeUser(user: User) {
    const plain = instanceToPlain(user) as any;
    const { password, ...result } = plain;
    return result;
  }
}
