import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './entities/goal.entity';
import { CreateGoalDto } from './dto/create-goal.dto';
import { GroupService } from '../group/group.service';

@Injectable()
export class GoalService {
  constructor(
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
    private groupService: GroupService,
  ) {}

  async createGoal(userId: number, dto: CreateGoalDto): Promise<any> {
    const isMember = await this.groupService.isGroupMember(dto.groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('不是该小组成员');
    }

    const goal = this.goalRepository.create({
      userId,
      groupId: dto.groupId,
      title: dto.title,
      description: dto.description,
      targetValue: dto.targetValue,
      unit: dto.unit || '天',
      deadline: dto.deadline,
    });
    await this.goalRepository.save(goal);

    return this.formatGoal(goal);
  }

  async getUserGoals(userId: number, groupId?: number): Promise<any> {
    const where: any = { userId };
    if (groupId) {
      where.groupId = groupId;
    }

    const goals = await this.goalRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['group'],
    });

    return goals.map((g) => this.formatGoal(g));
  }

  async getGroupGoals(groupId: number): Promise<any> {
    const goals = await this.goalRepository.find({
      where: { groupId },
      order: { createdAt: 'DESC' },
      relations: ['user', 'group'],
    });

    return goals.map((g) => ({
      ...this.formatGoal(g),
      user: {
        id: g.user.id,
        username: g.user.username,
        nickname: g.user.nickname,
        avatar: g.user.avatar,
      },
    }));
  }

  async updateGoalProgress(userId: number, goalId: number, increment: number = 1): Promise<any> {
    const goal = await this.goalRepository.findOne({ where: { id: goalId } });
    if (!goal) {
      throw new NotFoundException('目标不存在');
    }
    if (goal.userId !== userId) {
      throw new ForbiddenException('无权修改此目标');
    }

    goal.currentValue = Math.min(goal.currentValue + increment, goal.targetValue);
    if (goal.currentValue >= goal.targetValue) {
      goal.status = 'completed';
    }
    await this.goalRepository.save(goal);

    return this.formatGoal(goal);
  }

  async updateGoalStatus(userId: number, goalId: number, status: string): Promise<any> {
    const goal = await this.goalRepository.findOne({ where: { id: goalId } });
    if (!goal) {
      throw new NotFoundException('目标不存在');
    }
    if (goal.userId !== userId) {
      throw new ForbiddenException('无权修改此目标');
    }

    goal.status = status as any;
    await this.goalRepository.save(goal);

    return this.formatGoal(goal);
  }

  async deleteGoal(userId: number, goalId: number): Promise<any> {
    const goal = await this.goalRepository.findOne({ where: { id: goalId } });
    if (!goal) {
      throw new NotFoundException('目标不存在');
    }
    if (goal.userId !== userId) {
      throw new ForbiddenException('无权删除此目标');
    }

    await this.goalRepository.remove(goal);
    return { success: true };
  }

  private formatGoal(goal: Goal): any {
    return {
      id: goal.id,
      userId: goal.userId,
      groupId: goal.groupId,
      title: goal.title,
      description: goal.description,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      unit: goal.unit,
      deadline: goal.deadline,
      status: goal.status,
      progress: goal.targetValue > 0 ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
      group: goal.group
        ? {
            id: goal.group.id,
            name: goal.group.name,
          }
        : null,
    };
  }
}
