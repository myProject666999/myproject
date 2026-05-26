import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from './space.entity';
import { SpaceMember } from './space-member.entity';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
    @InjectRepository(SpaceMember)
    private readonly spaceMemberRepository: Repository<SpaceMember>,
  ) {}

  async createSpace(
    ownerId: number,
    data: { name: string; description?: string },
  ): Promise<Space> {
    const space = this.spaceRepository.create({
      name: data.name,
      description: data.description,
      owner_id: ownerId,
    });
    const saved = await this.spaceRepository.save(space);

    const ownerMember = this.spaceMemberRepository.create({
      space_id: saved.id,
      user_id: ownerId,
      role: 1,
    });
    await this.spaceMemberRepository.save(ownerMember);

    return saved;
  }

  async getSpaceById(spaceId: number): Promise<Space> {
    const space = await this.spaceRepository.findOne({
      where: { id: spaceId },
      relations: ['owner', 'members', 'members.user'],
    });
    if (!space) {
      throw new NotFoundException('Space not found');
    }
    return space;
  }

  async getUserSpaces(userId: number): Promise<Space[]> {
    const memberRecords = await this.spaceMemberRepository.find({
      where: { user_id: userId },
    });
    if (memberRecords.length === 0) {
      return [];
    }
    const spaceIds = memberRecords.map((m) => m.space_id);
    return this.spaceRepository
      .createQueryBuilder('space')
      .leftJoinAndSelect('space.owner', 'owner')
      .where('space.id IN (:...spaceIds)', { spaceIds })
      .orderBy('space.created_at', 'DESC')
      .getMany();
  }

  async updateSpace(
    spaceId: number,
    data: { name?: string; description?: string; avatar?: string },
  ): Promise<Space> {
    const space = await this.getSpaceById(spaceId);
    if (data.name !== undefined) space.name = data.name;
    if (data.description !== undefined) space.description = data.description;
    if (data.avatar !== undefined) space.avatar = data.avatar;
    space.updated_at = new Date();
    return this.spaceRepository.save(space);
  }

  async deleteSpace(spaceId: number): Promise<void> {
    await this.spaceMemberRepository.delete({ space_id: spaceId });
    const result = await this.spaceRepository.delete({ id: spaceId });
    if (result.affected === 0) {
      throw new NotFoundException('Space not found');
    }
  }

  async getSpaceMembers(spaceId: number): Promise<any[]> {
    const members = await this.spaceMemberRepository.find({
      where: { space_id: spaceId },
      relations: ['user'],
    });
    return members.map((m) => ({
      id: m.id,
      space_id: m.space_id,
      user_id: m.user_id,
      role: m.role,
      joined_at: m.joined_at,
      user: m.user
        ? {
            id: m.user.id,
            username: m.user.username,
            email: m.user.email,
            avatar: m.user.avatar,
          }
        : null,
    }));
  }

  async addMember(
    spaceId: number,
    userId: number,
    role: number,
  ): Promise<SpaceMember> {
    const exists = await this.spaceMemberRepository.findOne({
      where: { space_id: spaceId, user_id: userId },
    });
    if (exists) {
      throw new BadRequestException('User is already a member of this space');
    }
    const member = this.spaceMemberRepository.create({
      space_id: spaceId,
      user_id: userId,
      role,
    });
    return this.spaceMemberRepository.save(member);
  }

  async updateMemberRole(
    spaceId: number,
    userId: number,
    role: number,
  ): Promise<void> {
    const member = await this.spaceMemberRepository.findOne({
      where: { space_id: spaceId, user_id: userId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }
    member.role = role;
    await this.spaceMemberRepository.save(member);
  }

  async removeMember(spaceId: number, userId: number): Promise<void> {
    const result = await this.spaceMemberRepository.delete({
      space_id: spaceId,
      user_id: userId,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Member not found');
    }
  }

  async getUserRoleInSpace(spaceId: number, userId: number): Promise<number> {
    const member = await this.spaceMemberRepository.findOne({
      where: { space_id: spaceId, user_id: userId },
    });
    if (!member) {
      return 0;
    }
    return member.role;
  }
}
