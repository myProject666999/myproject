import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from '../common/types/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, password, nickname } = registerDto;

    const existing = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });
    if (existing) {
      throw new ConflictException('用户名或邮箱已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      nickname: nickname || username,
    });
    const saved = await this.userRepository.save(user);

    const payload: JwtPayload = {
      userId: saved.id,
      username: saved.username,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: saved.id,
        username: saved.username,
        email: saved.email,
        nickname: saved.nickname,
        avatarUrl: saved.avatarUrl,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .orWhere('user.email = :username', { username })
      .getOne();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    if (user.status !== 1) {
      throw new UnauthorizedException('账户已被禁用');
    }

    const payload: JwtPayload = {
      userId: user.id,
      username: user.username,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: payload.userId } });
  }
}
