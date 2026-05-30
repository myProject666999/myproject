import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeRelation } from '../../entities/knowledge-relation.entity';
import { KnowledgePoint } from '../../entities/knowledge-point.entity';
import { CreateKnowledgeRelationDto } from './dto/create-knowledge-relation.dto';

@Injectable()
export class KnowledgeRelationService {
  constructor(
    @InjectRepository(KnowledgeRelation)
    private readonly relationRepository: Repository<KnowledgeRelation>,
    @InjectRepository(KnowledgePoint)
    private readonly kpRepository: Repository<KnowledgePoint>,
  ) {}

  async findByKpId(kpId: number): Promise<KnowledgeRelation[]> {
    await this.validateKpExists(kpId);
    return this.relationRepository.find({
      where: [{ fromKpId: kpId }, { toKpId: kpId }],
      relations: { fromKp: true, toKp: true } as any,
    });
  }

  async create(dto: CreateKnowledgeRelationDto): Promise<KnowledgeRelation> {
    if (dto.fromKpId === dto.toKpId) {
      throw new ConflictException('不能创建与自身的关系');
    }
    await this.validateKpExists(dto.fromKpId);
    await this.validateKpExists(dto.toKpId);

    const existing = await this.relationRepository.findOne({
      where: {
        fromKpId: dto.fromKpId,
        toKpId: dto.toKpId,
        relationType: dto.relationType,
      },
    });
    if (existing) {
      throw new ConflictException('该关系已存在');
    }

    const relation = this.relationRepository.create(dto);
    return this.relationRepository.save(relation);
  }

  async remove(id: number): Promise<void> {
    const relation = await this.relationRepository.findOne({
      where: { id },
    });
    if (!relation) {
      throw new NotFoundException(`关系 ID ${id} 不存在`);
    }
    await this.relationRepository.softRemove(relation);
  }

  private async validateKpExists(kpId: number): Promise<void> {
    const kp = await this.kpRepository.findOne({
      where: { id: kpId, status: 1 },
    });
    if (!kp) {
      throw new NotFoundException(`知识点 ID ${kpId} 不存在`);
    }
  }
}
