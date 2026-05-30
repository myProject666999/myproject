import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { JwtPayload, RequestUser } from '../../../common/types';
import { RedisService } from '../../../common/services/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<RequestUser> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) {
      throw new UnauthorizedException('请先登录');
    }

    const isBlacklisted = await this.redisService.exists(
      `token:blacklist:${token}`,
    );
    if (isBlacklisted) {
      throw new UnauthorizedException('Token已失效，请重新登录');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub, status: 1 },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      realName: user.realName,
    };
  }
}
