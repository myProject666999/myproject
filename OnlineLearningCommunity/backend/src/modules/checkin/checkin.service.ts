import { Injectable, NotFoundException, ConflictException, Inject, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import Redis from 'ioredis';
import { Checkin } from './entities/checkin.entity';
import { CreateCheckinDto } from './dto/create-checkin.dto';
import { UserService } from '../user/user.service';
import { GroupService } from '../group/group.service';

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(Checkin)
    private checkinRepository: Repository<Checkin>,
    private dataSource: DataSource,
    private userService: UserService,
    private groupService: GroupService,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  async checkin(userId: number, groupId: number, dto: CreateCheckinDto): Promise<any> {
    const isMember = await this.groupService.isGroupMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('不是该小组成员，无法打卡');
    }

    const today = new Date().toISOString().split('T')[0];
    const existingCheckin = await this.checkinRepository.findOne({
      where: { userId, groupId, checkinDate: today },
    });
    if (existingCheckin) {
      throw new ConflictException('今天已打卡');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const checkin = this.checkinRepository.create({
        userId,
        groupId,
        checkinDate: today,
        content: dto.content,
        studyMinutes: dto.studyMinutes,
        mood: dto.mood,
      });
      await queryRunner.manager.save(checkin);

      const user = await this.userService.findById(userId);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newCurrentStreak = 1;
      if (user.lastCheckinAt) {
        const lastCheckinDate = user.lastCheckinAt.toISOString().split('T')[0];
        if (lastCheckinDate === yesterdayStr) {
          newCurrentStreak = user.currentStreak + 1;
        } else if (lastCheckinDate !== today) {
          newCurrentStreak = 1;
        } else {
          newCurrentStreak = user.currentStreak;
        }
      }

      const newMaxStreak = Math.max(user.maxStreak, newCurrentStreak);
      await this.userService.updateUserStats(userId, {
        totalCheckins: user.totalCheckins + 1,
        currentStreak: newCurrentStreak,
        maxStreak: newMaxStreak,
        lastCheckinAt: new Date(),
      });

      const memberRole = await this.groupService.getMemberRole(groupId, userId);
      const memberCheckins = await this.getGroupCheckinCount(groupId, userId);
      const groupStreak = await this.calculateGroupStreak(groupId, userId, today);
      await this.groupService.updateGroupMemberStats(groupId, userId, {
        groupCheckins: memberCheckins + 1,
        groupStreak,
      });

      await this.redis.zincrby(`ranking:group:${groupId}`, 1, userId.toString());
      await this.redis.zincrby('ranking:global', 1, userId.toString());

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: '打卡成功',
        data: {
          id: checkin.id,
          checkinDate: checkin.checkinDate,
          content: checkin.content,
          studyMinutes: checkin.studyMinutes,
          mood: checkin.mood,
          currentStreak: newCurrentStreak,
          maxStreak: newMaxStreak,
          totalCheckins: user.totalCheckins + 1,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getGroupCheckinCount(groupId: number, userId: number): Promise<number> {
    return this.checkinRepository.count({ where: { groupId, userId } });
  }

  async calculateGroupStreak(groupId: number, userId: number, today: string): Promise<number> {
    const checkins = await this.checkinRepository.find({
      where: { groupId, userId },
      order: { checkinDate: 'DESC' },
      select: ['checkinDate'],
    });

    if (checkins.length === 0) return 0;

    let streak = 0;
    const checkinDates = checkins.map((c) => c.checkinDate);
    const todayDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(todayDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      if (checkinDates.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  }

  async getUserCheckins(userId: number, groupId?: number, page: number = 1, limit: number = 20): Promise<any> {
    const where: any = { userId };
    if (groupId) {
      where.groupId = groupId;
    }

    const [checkins, total] = await this.checkinRepository.findAndCount({
      where,
      order: { checkinDate: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['group'],
    });

    return {
      data: checkins.map((c) => ({
        id: c.id,
        userId: c.userId,
        groupId: c.groupId,
        groupName: c.group?.name,
        checkinDate: c.checkinDate,
        content: c.content,
        studyMinutes: c.studyMinutes,
        mood: c.mood,
        createdAt: c.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  async getGroupCheckins(groupId: number, page: number = 1, limit: number = 20): Promise<any> {
    const [checkins, total] = await this.checkinRepository.findAndCount({
      where: { groupId },
      order: { checkinDate: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });

    return {
      data: checkins.map((c) => ({
        id: c.id,
        userId: c.userId,
        user: {
          id: c.user.id,
          username: c.user.username,
          nickname: c.user.nickname,
          avatar: c.user.avatar,
        },
        checkinDate: c.checkinDate,
        content: c.content,
        studyMinutes: c.studyMinutes,
        mood: c.mood,
        createdAt: c.createdAt,
      })),
      total,
      page,
      limit,
    };
  }

  async hasCheckedInToday(userId: number, groupId: number): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const checkin = await this.checkinRepository.findOne({
      where: { userId, groupId, checkinDate: today },
    });
    return !!checkin;
  }

  async getCheckinStats(userId: number): Promise<any> {
    const allCheckins = await this.checkinRepository.find({
      where: { userId },
      select: ['checkinDate'],
    });

    const dateSet = new Set(allCheckins.map((c) => c.checkinDate));
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    let monthCheckins = 0;
    allCheckins.forEach((c) => {
      const d = new Date(c.checkinDate);
      if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
        monthCheckins++;
      }
    });

    let weekCheckins = 0;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      if (dateSet.has(d.toISOString().split('T')[0])) {
        weekCheckins++;
      }
    }

    return {
      totalCheckins: allCheckins.length,
      monthCheckins,
      weekCheckins,
    };
  }
}
