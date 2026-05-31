import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { GroupMember } from '../group/entities/group-member.entity';
import { StudyGroup } from '../group/entities/study-group.entity';

@Injectable()
export class RankingService {
  constructor(
    @Inject('REDIS_CLIENT') private redis: Redis,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(GroupMember)
    private memberRepository: Repository<GroupMember>,
    @InjectRepository(StudyGroup)
    private groupRepository: Repository<StudyGroup>,
  ) {}

  async getGroupRanking(groupId: number, limit: number = 20): Promise<any> {
    const key = `ranking:group:${groupId}`;
    
    const cached = await this.redis.zrevrange(key, 0, limit - 1, 'WITHSCORES');
    let rankings: any[] = [];

    if (cached.length > 0) {
      for (let i = 0; i < cached.length; i += 2) {
        const userId = parseInt(cached[i]);
        const score = parseInt(cached[i + 1]);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (user) {
          const member = await this.memberRepository.findOne({
            where: { groupId, userId },
          });
          rankings.push({
            rank: i / 2 + 1,
            userId: user.id,
            username: user.username,
            nickname: user.nickname,
            avatar: user.avatar,
            score,
            groupStreak: member?.groupStreak || 0,
            groupCheckins: member?.groupCheckins || 0,
          });
        }
      }
    } else {
      const members = await this.memberRepository.find({
        where: { groupId },
        relations: ['user'],
        order: { groupCheckins: 'DESC' },
        take: limit,
      });

      rankings = members.map((m, index) => ({
        rank: index + 1,
        userId: m.user.id,
        username: m.user.username,
        nickname: m.user.nickname,
        avatar: m.user.avatar,
        score: m.groupCheckins,
        groupStreak: m.groupStreak,
        groupCheckins: m.groupCheckins,
      }));

      if (members.length > 0) {
        const pipeline = this.redis.pipeline();
        members.forEach((m) => {
          pipeline.zadd(key, m.groupCheckins, m.userId.toString());
        });
        await pipeline.exec();
      }
    }

    return rankings;
  }

  async getGlobalRanking(limit: number = 20): Promise<any> {
    const key = 'ranking:global';

    const cached = await this.redis.zrevrange(key, 0, limit - 1, 'WITHSCORES');
    let rankings: any[] = [];

    if (cached.length > 0) {
      for (let i = 0; i < cached.length; i += 2) {
        const userId = parseInt(cached[i]);
        const score = parseInt(cached[i + 1]);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (user) {
          rankings.push({
            rank: i / 2 + 1,
            userId: user.id,
            username: user.username,
            nickname: user.nickname,
            avatar: user.avatar,
            score,
            totalCheckins: user.totalCheckins,
            currentStreak: user.currentStreak,
            maxStreak: user.maxStreak,
          });
        }
      }
    } else {
      const users = await this.userRepository.find({
        order: { totalCheckins: 'DESC' },
        take: limit,
      });

      rankings = users.map((u, index) => ({
        rank: index + 1,
        userId: u.id,
        username: u.username,
        nickname: u.nickname,
        avatar: u.avatar,
        score: u.totalCheckins,
        totalCheckins: u.totalCheckins,
        currentStreak: u.currentStreak,
        maxStreak: u.maxStreak,
      }));

      if (users.length > 0) {
        const pipeline = this.redis.pipeline();
        users.forEach((u) => {
          pipeline.zadd(key, u.totalCheckins, u.id.toString());
        });
        await pipeline.exec();
      }
    }

    return rankings;
  }

  async getUserGlobalRank(userId: number): Promise<number> {
    const key = 'ranking:global';
    const rank = await this.redis.zrevrank(key, userId.toString());
    return rank !== null ? rank + 1 : null;
  }

  async getUserGroupRank(userId: number, groupId: number): Promise<number> {
    const key = `ranking:group:${groupId}`;
    const rank = await this.redis.zrevrank(key, userId.toString());
    return rank !== null ? rank + 1 : null;
  }

  async getGroupRankingByStreak(groupId: number, limit: number = 20): Promise<any> {
    const members = await this.memberRepository.find({
      where: { groupId },
      relations: ['user'],
      order: { groupStreak: 'DESC' },
      take: limit,
    });

    return members.map((m, index) => ({
      rank: index + 1,
      userId: m.user.id,
      username: m.user.username,
      nickname: m.user.nickname,
      avatar: m.user.avatar,
      groupStreak: m.groupStreak,
      groupCheckins: m.groupCheckins,
    }));
  }

  async refreshGroupRanking(groupId: number): Promise<void> {
    const key = `ranking:group:${groupId}`;
    await this.redis.del(key);

    const members = await this.memberRepository.find({
      where: { groupId },
    });

    if (members.length > 0) {
      const pipeline = this.redis.pipeline();
      members.forEach((m) => {
        pipeline.zadd(key, m.groupCheckins, m.userId.toString());
      });
      await pipeline.exec();
    }
  }

  async refreshGlobalRanking(): Promise<void> {
    const key = 'ranking:global';
    await this.redis.del(key);

    const users = await this.userRepository.find();

    if (users.length > 0) {
      const pipeline = this.redis.pipeline();
      users.forEach((u) => {
        pipeline.zadd(key, u.totalCheckins, u.id.toString());
      });
      await pipeline.exec();
    }
  }
}
