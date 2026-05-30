import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { UserRole, RequestUser, JwtPayload } from '../../common/types';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuditService } from '../../common/services/audit.service';
import { RedisService } from '../../common/services/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
    private redisService: RedisService,
  ) {}

  async login(user: RequestUser, ipAddress?: string, userAgent?: string) {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    const userInfo = await this.userRepository.findOne({
      where: { id: user.id },
      select: [
        'id',
        'username',
        'realName',
        'role',
        'email',
        'phone',
        'avatar',
        'lastLoginAt',
      ],
    });

    await this.auditService.log(
      user,
      'login',
      'auth',
      user.id,
      '用户登录',
      null,
      { userId: user.id, username: user.username },
      ipAddress,
      userAgent,
      1,
    );

    return {
      accessToken: token,
      user: userInfo,
    };
  }

  async register(
    registerDto: RegisterDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { username, password, realName } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }

    const saltRounds = this.configService.get<number>('bcrypt.saltRounds');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      realName,
      role: UserRole.STUDENT,
      status: 1,
    });

    const savedUser = await this.userRepository.save(user);

    const requestUser: RequestUser = {
      id: savedUser.id,
      username: savedUser.username,
      role: savedUser.role,
      realName: savedUser.realName,
    };

    await this.auditService.log(
      requestUser,
      'register',
      'auth',
      savedUser.id,
      '用户注册',
      { username, realName },
      { userId: savedUser.id, username: savedUser.username },
      ipAddress,
      userAgent,
      1,
    );

    const payload: JwtPayload = {
      sub: savedUser.id,
      username: savedUser.username,
      role: savedUser.role,
    };

    const token = this.jwtService.sign(payload);

    const userInfo = {
      id: savedUser.id,
      username: savedUser.username,
      realName: savedUser.realName,
      role: savedUser.role,
      email: savedUser.email,
      phone: savedUser.phone,
      avatar: savedUser.avatar,
      lastLoginAt: savedUser.lastLoginAt,
    };

    return {
      accessToken: token,
      user: userInfo,
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId, status: 1 },
      select: [
        'id',
        'username',
        'realName',
        'role',
        'email',
        'phone',
        'avatar',
        'createdAt',
        'lastLoginAt',
      ],
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    return user;
  }

  async changePassword(
    user: RequestUser,
    changePasswordDto: ChangePasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { oldPassword, newPassword } = changePasswordDto;

    const dbUser = await this.userRepository.findOne({
      where: { id: user.id, status: 1 },
    });

    if (!dbUser) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, dbUser.password);
    if (!isPasswordValid) {
      throw new BadRequestException('原密码错误');
    }

    if (oldPassword === newPassword) {
      throw new BadRequestException('新密码不能与原密码相同');
    }

    const saltRounds = this.configService.get<number>('bcrypt.saltRounds');
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
    });

    await this.auditService.log(
      user,
      'change_password',
      'auth',
      user.id,
      '修改密码',
      null,
      null,
      ipAddress,
      userAgent,
      1,
    );

    return {
      message: '密码修改成功',
    };
  }

  async logout(
    user: RequestUser,
    token: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const decoded = this.jwtService.decode(token);
    const expiresIn = decoded.exp
      ? decoded.exp - Math.floor(Date.now() / 1000)
      : 7 * 24 * 60 * 60;

    await this.redisService.set(`token:blacklist:${token}`, '1', expiresIn);

    await this.auditService.log(
      user,
      'logout',
      'auth',
      user.id,
      '用户登出',
      null,
      { userId: user.id, username: user.username },
      ipAddress,
      userAgent,
      1,
    );

    return {
      message: '登出成功',
    };
  }
}
