import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import Redis from 'ioredis';
import { StudyGroup } from './entities/study-group.entity';
import { GroupMember } from './entities/group-member.entity';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(StudyGroup)
    private groupRepository: Repository<StudyGroup>,
    @InjectRepository(GroupMember)
    private memberRepository: Repository<GroupMember>,
    private dataSource: DataSource,
    @Inject('REDIS_CLIENT') private redis: Redis,
  ) {}

  async createGroup(userId: number, createGroupDto: CreateGroupDto): Promise<StudyGroup> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const group = this.groupRepository.create({
        ...createGroupDto,
        ownerId: userId,
        memberCount: 1,
      });
      const savedGroup = await queryRunner.manager.save(group);

      const member = this.memberRepository.create({
        groupId: savedGroup.id,
        userId,
        role: 'owner',
      });
      await queryRunner.manager.save(member);

      await queryRunner.commitTransaction();
      return savedGroup;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(page: number = 1, limit: number = 20, category?: string, keyword?: string): Promise<any> {
    const queryBuilder = this.groupRepository
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.owner', 'owner')
      .leftJoinAndSelect('g.members', 'members')
      .where('g.isPrivate = :isPrivate', { isPrivate: false });

    if (category) {
      queryBuilder.andWhere('g.category = :category', { category });
    }

    if (keyword) {
      queryBuilder.andWhere('g.name LIKE :keyword OR g.description LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    const total = await queryBuilder.getCount();
    const groups = await queryBuilder
      .orderBy('g.memberCount', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data: groups.map((g) => this.formatGroup(g)),
      total,
      page,
      limit,
    };
  }

  async findById(id: number): Promise<StudyGroup> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['owner', 'members', 'members.user'],
    });
    if (!group) {
      throw new NotFoundException('小组不存在');
    }
    return group;
  }

  async getGroupDetail(id: number): Promise<any> {
    const group = await this.findById(id);
    const members = await this.memberRepository.find({
      where: { groupId: id },
      relations: ['user'],
      order: { groupCheckins: 'DESC' },
    });
    return {
      ...this.formatGroup(group),
      members: members.map((m) => ({
        id: m.user.id,
        username: m.user.username,
        nickname: m.user.nickname,
        avatar: m.user.avatar,
        role: m.role,
        groupStreak: m.groupStreak,
        groupCheckins: m.groupCheckins,
        joinedAt: m.joinedAt,
      })),
    };
  }

  async joinGroup(groupId: number, userId: number): Promise<any> {
    const group = await this.findById(groupId);

    if (group.memberCount >= group.maxMembers) {
      throw new ConflictException('小组已满');
    }

    const existingMember = await this.memberRepository.findOne({
      where: { groupId, userId },
    });
    if (existingMember) {
      throw new ConflictException('已加入该小组');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const member = new GroupMember();
      member.groupId = groupId;
      member.userId = userId;
      member.role = 'member';
      member.groupStreak = 0;
      member.groupCheckins = 0;
      await queryRunner.manager.save(GroupMember, member);

      const updatedGroup = await queryRunner.manager.findOne(StudyGroup, { where: { id: groupId } });
      if (updatedGroup) {
        updatedGroup.memberCount += 1;
        await queryRunner.manager.save(StudyGroup, updatedGroup);
      }

      await queryRunner.commitTransaction();
      return { success: true, message: '加入成功' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async leaveGroup(groupId: number, userId: number): Promise<any> {
    const group = await this.findById(groupId);

    if (group.ownerId === userId) {
      throw new ConflictException('组长不能退出小组，请先转让或解散小组');
    }

    const member = await this.memberRepository.findOne({
      where: { groupId, userId },
    });
    if (!member) {
      throw new NotFoundException('不是该小组成员');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.remove(member);
      group.memberCount -= 1;
      await queryRunner.manager.save(group);

      await queryRunner.commitTransaction();
      return { success: true, message: '已退出小组' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getUserGroups(userId: number): Promise<any> {
    const members = await this.memberRepository.find({
      where: { userId },
      relations: ['group', 'group.owner'],
    });
    return members.map((m) => ({
      id: m.group.id,
      name: m.group.name,
      avatar: m.group.avatar,
      category: m.group.category,
      memberCount: m.group.memberCount,
      maxMembers: m.group.maxMembers,
      role: m.role,
      groupStreak: m.groupStreak,
      groupCheckins: m.groupCheckins,
    }));
  }

  async updateGroupMemberStats(groupId: number, userId: number, stats: Partial<GroupMember>): Promise<void> {
    await this.memberRepository.update({ groupId, userId }, stats);
  }

  async isGroupMember(groupId: number, userId: number): Promise<boolean> {
    const member = await this.memberRepository.findOne({
      where: { groupId, userId },
    });
    return !!member;
  }

  async getMemberRole(groupId: number, userId: number): Promise<string> {
    const member = await this.memberRepository.findOne({
      where: { groupId, userId },
    });
    return member?.role || null;
  }

  private formatGroup(group: StudyGroup): any {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      avatar: group.avatar,
      category: group.category,
      maxMembers: group.maxMembers,
      memberCount: group.memberCount,
      isPrivate: group.isPrivate,
      ownerId: group.ownerId,
      owner: group.owner
        ? {
            id: group.owner.id,
            username: group.owner.username,
            nickname: group.owner.nickname,
            avatar: group.owner.avatar,
          }
        : null,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }
}
