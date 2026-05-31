import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgePoint } from '../../entities/knowledge-point.entity';
import { KnowledgeRelation } from '../../entities/knowledge-relation.entity';
import { Subject } from '../../entities/subject.entity';
import { CreateKnowledgePointDto } from './dto/create-knowledge-point.dto';
import { UpdateKnowledgePointDto } from './dto/update-knowledge-point.dto';
import { QueryKnowledgeDto } from './dto/query-knowledge.dto';
import { PaginationResult, KnowledgeRelationType } from '../../common/types';

type KnowledgePointWithChildren = Omit<KnowledgePoint, 'children'> & {
  children?: KnowledgePointWithChildren[];
};

interface GraphNode {
  id: number;
  name: string;
  code: string;
  subjectId: number;
  depth: number;
  difficultyLevel: number;
  importanceLevel: number;
}

interface GraphEdge {
  id: number;
  source: number;
  target: number;
  relationType: KnowledgeRelationType;
  weight: number;
  description?: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

@Injectable()
export class KnowledgePointService {
  constructor(
    @InjectRepository(KnowledgePoint)
    private readonly kpRepository: Repository<KnowledgePoint>,
    @InjectRepository(KnowledgeRelation)
    private readonly relationRepository: Repository<KnowledgeRelation>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async findAll(
    query: QueryKnowledgeDto,
  ): Promise<
    PaginationResult<KnowledgePointWithChildren> | KnowledgePointWithChildren[]
  > {
    const where: any = { status: 1 };
    if (query.subjectId) {
      where.subjectId = query.subjectId;
    }
    if (query.parentId !== undefined) {
      where.parentId = query.parentId;
    }

    const [list, total] = await this.kpRepository.findAndCount({
      where,
      order: { sortOrder: 'ASC', id: 'ASC' },
      relations: { children: true },
      skip:
        query.page && query.pageSize
          ? (query.page - 1) * query.pageSize
          : undefined,
      take: query.pageSize,
    });

    const treeList = await this.buildTree(list);

    if (query.page && query.pageSize) {
      return {
        list: treeList,
        total,
        page: query.page,
        pageSize: query.pageSize,
      };
    }

    return treeList;
  }

  async getTree(subjectId: number): Promise<KnowledgePointWithChildren[]> {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId, status: 1 },
    });
    if (!subject) {
      throw new NotFoundException(`学科 ID ${subjectId} 不存在`);
    }

    const allPoints = await this.kpRepository.find({
      where: { subjectId, status: 1 },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });

    return this.buildTree(allPoints);
  }

  async findOne(id: number): Promise<KnowledgePointWithChildren> {
    const kp = await this.kpRepository.findOne({
      where: { id, status: 1 },
      relations: { subject: true, parent: true, children: true },
    });
    if (!kp) {
      throw new NotFoundException(`知识点 ID ${id} 不存在`);
    }

    const relations = await this.relationRepository.find({
      where: [{ fromKpId: id }, { toKpId: id }],
      relations: { fromKp: true, toKp: true },
    });

    const result = kp as KnowledgePointWithChildren;
    (result as any).relations = relations;
    return result;
  }

  async create(dto: CreateKnowledgePointDto): Promise<KnowledgePoint> {
    await this.validateSubjectExists(dto.subjectId);

    if (dto.parentId) {
      await this.validateKpExists(dto.parentId);
    }

    const existing = await this.kpRepository.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`知识点编码 ${dto.code} 已存在`);
    }

    const depth = dto.parentId
      ? (await this.calculateDepth(dto.parentId)) + 1
      : 1;
    const path = dto.parentId
      ? await this.buildPath(dto.parentId, dto.code)
      : dto.code;

    const kp = this.kpRepository.create({
      ...dto,
      depth,
      path,
    });

    return this.kpRepository.save(kp);
  }

  async update(
    id: number,
    dto: UpdateKnowledgePointDto,
  ): Promise<KnowledgePoint> {
    const kp = await this.validateKpExists(id);

    if (dto.code && dto.code !== kp.code) {
      const existing = await this.kpRepository.findOne({
        where: { code: dto.code },
      });
      if (existing) {
        throw new ConflictException(`知识点编码 ${dto.code} 已存在`);
      }
    }

    if (dto.subjectId && dto.subjectId !== kp.subjectId) {
      await this.validateSubjectExists(dto.subjectId);
    }

    if (dto.parentId !== undefined && dto.parentId !== kp.parentId) {
      if (dto.parentId === id) {
        throw new ConflictException('父节点不能是自身');
      }
      if (dto.parentId) {
        await this.validateKpExists(dto.parentId);
      }
      const depth = dto.parentId
        ? (await this.calculateDepth(dto.parentId)) + 1
        : 1;
      const path = dto.parentId
        ? await this.buildPath(dto.parentId, dto.code || kp.code)
        : dto.code || kp.code;
      Object.assign(kp, { depth, path });
    }

    Object.assign(kp, dto);
    return this.kpRepository.save(kp);
  }

  async remove(id: number): Promise<void> {
    const kp = await this.validateKpExists(id);

    const childrenCount = await this.kpRepository.count({
      where: { parentId: id, status: 1 },
    });
    if (childrenCount > 0) {
      throw new ConflictException('该知识点下还有子节点，无法删除');
    }

    await this.kpRepository.softRemove(kp);
  }

  async getGraph(id: number, depth: number = 2): Promise<GraphData> {
    await this.validateKpExists(id);

    const visited = new Set<number>();
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    await this.traverseGraph(id, depth, visited, nodes, edges);

    return { nodes, edges };
  }

  private async traverseGraph(
    currentId: number,
    remainingDepth: number,
    visited: Set<number>,
    nodes: GraphNode[],
    edges: GraphEdge[],
  ): Promise<void> {
    if (visited.has(currentId) || remainingDepth < 0) {
      return;
    }

    visited.add(currentId);

    const kp = await this.kpRepository.findOne({
      where: { id: currentId, status: 1 },
    });
    if (!kp) {
      return;
    }

    nodes.push({
      id: kp.id,
      name: kp.name,
      code: kp.code,
      subjectId: kp.subjectId,
      depth: kp.depth,
      difficultyLevel: kp.difficultyLevel,
      importanceLevel: kp.importanceLevel,
    });

    const relations = await this.relationRepository.find({
      where: [{ fromKpId: currentId }, { toKpId: currentId }],
    });

    for (const relation of relations) {
      const relatedId =
        relation.fromKpId === currentId ? relation.toKpId : relation.fromKpId;

      edges.push({
        id: relation.id,
        source: relation.fromKpId,
        target: relation.toKpId,
        relationType: relation.relationType,
        weight: relation.weight,
        description: relation.description,
      });

      if (!visited.has(relatedId)) {
        await this.traverseGraph(
          relatedId,
          remainingDepth - 1,
          visited,
          nodes,
          edges,
        );
      }
    }
  }

  private async buildTree(
    points: KnowledgePoint[],
  ): Promise<KnowledgePointWithChildren[]> {
    const pointMap = new Map<number, KnowledgePointWithChildren>();
    const roots: KnowledgePointWithChildren[] = [];

    for (const point of points) {
      pointMap.set(point.id, { ...point, children: [] });
    }

    for (const point of points) {
      const node = pointMap.get(point.id)!;
      if (point.parentId && pointMap.has(point.parentId)) {
        const parent = pointMap.get(point.parentId)!;
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
      } else if (!point.parentId) {
        roots.push(node);
      }
    }

    const sortNodes = (
      nodes: KnowledgePointWithChildren[],
    ): KnowledgePointWithChildren[] => {
      nodes.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          sortNodes(node.children);
        }
      });
      return nodes;
    };

    return sortNodes(roots);
  }

  private async validateSubjectExists(subjectId: number): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId, status: 1 },
    });
    if (!subject) {
      throw new NotFoundException(`学科 ID ${subjectId} 不存在`);
    }
    return subject;
  }

  private async validateKpExists(id: number): Promise<KnowledgePoint> {
    const kp = await this.kpRepository.findOne({
      where: { id, status: 1 },
    });
    if (!kp) {
      throw new NotFoundException(`知识点 ID ${id} 不存在`);
    }
    return kp;
  }

  private async calculateDepth(parentId: number): Promise<number> {
    const parent = await this.kpRepository.findOne({
      where: { id: parentId },
      select: { depth: true },
    });
    return parent?.depth || 0;
  }

  private async buildPath(parentId: number, code: string): Promise<string> {
    const parent = await this.kpRepository.findOne({
      where: { id: parentId },
      select: { path: true },
    });
    return parent?.path ? `${parent.path}/${code}` : code;
  }
}
