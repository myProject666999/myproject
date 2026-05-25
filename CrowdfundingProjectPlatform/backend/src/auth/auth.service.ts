import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { username: dto.username } });
    if (exists) throw new BadRequestException('用户名已存在');
    const user = this.userRepo.create({
      username: dto.username,
      nickname: dto.nickname,
      passwordHash: await bcrypt.hash(dto.password, 10),
    });
    await this.userRepo.save(user);
    return this.signToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { username: dto.username } });
    if (!user) throw new UnauthorizedException('用户名或密码错误');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('用户名或密码错误');
    if (user.status !== 1) throw new UnauthorizedException('账号已被禁用');
    return this.signToken(user);
  }

  private signToken(user: User) {
    const token = this.jwtService.sign({
      sub: user.id,
      username: user.username,
      role: user.role,
    });
    return {
      token,
      user: { id: user.id, username: user.username, nickname: user.nickname, role: user.role },
    };
  }
}
