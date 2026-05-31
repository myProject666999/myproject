import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Question } from '../../entities/question.entity';
import { QuestionKnowledge } from '../../entities/question-knowledge.entity';
import {
  CreateQuestionDto,
  KnowledgePointDto,
} from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QueryQuestionDto } from './dto/query-question.dto';
import { PaginationResult } from '../../common/types';
import { BatchImportDto } from './dto/batch-import.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(QuestionKnowledge)
    private readonly questionKnowledgeRepository: Repository<QuestionKnowledge>,
  ) {}

  async findAll(query: QueryQuestionDto): Promise<PaginationResult<Question>> {
    const {
      page = 1,
      pageSize = 10,
      subjectId,
      type,
      difficulty,
      knowledgePointId,
      keyword,
      status,
    } = query;
    const qb = this.questionRepository.createQueryBuilder('q');

    qb.leftJoinAndSelect('q.questionKnowledges', 'qk')
      .leftJoinAndSelect('qk.knowledgePoint', 'kp')
      .leftJoinAndSelect('q.subject', 's');

    if (subjectId) {
      qb.andWhere('q.subjectId = :subjectId', { subjectId });
    }
    if (type) {
      qb.andWhere('q.type = :type', { type });
    }
    if (difficulty) {
      qb.andWhere('q.difficulty = :difficulty', { difficulty });
    }
    if (knowledgePointId) {
      qb.innerJoin(
        'q.questionKnowledges',
        'qk2',
        'qk2.knowledgePointId = :knowledgePointId',
        { knowledgePointId },
      );
    }
    if (keyword) {
      qb.andWhere('q.content LIKE :keyword', { keyword: `%${keyword}%` });
    }
    if (status !== undefined) {
      qb.andWhere('q.status = :status', { status });
    }

    qb.orderBy('q.createdAt', 'DESC');

    const skip = (page - 1) * pageSize;
    const [list, total] = await qb.skip(skip).take(pageSize).getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findOne(id: number): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: {
        questionKnowledges: {
          knowledgePoint: true,
        },
        subject: true,
        creator: true,
      },
    });
    if (!question) {
      throw new NotFoundException('题目不存在');
    }
    return question;
  }

  async create(dto: CreateQuestionDto, creatorId?: number): Promise<Question> {
    const { knowledgePoints, ...questionData } = dto;

    const question = this.questionRepository.create({
      ...questionData,
      creatorId,
    });
    const savedQuestion = await this.questionRepository.save(question);

    if (knowledgePoints && knowledgePoints.length > 0) {
      await this.attachKnowledgePoints(savedQuestion.id, knowledgePoints);
    }

    return this.findOne(savedQuestion.id);
  }

  async update(id: number, dto: UpdateQuestionDto): Promise<Question> {
    const { knowledgePoints, ...updateData } = dto;
    await this.findOne(id);

    await this.questionRepository.update(id, updateData);

    if (knowledgePoints) {
      await this.questionKnowledgeRepository.delete({ questionId: id });
      if (knowledgePoints.length > 0) {
        await this.attachKnowledgePoints(id, knowledgePoints);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const question = await this.findOne(id);
    await this.questionRepository.softDelete(question.id);
  }

  async batchImport(
    dto: BatchImportDto,
    creatorId?: number,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    for (let i = 0; i < dto.questions.length; i++) {
      try {
        await this.create(dto.questions[i], creatorId);
        success++;
      } catch (e) {
        failed++;
        errors.push(
          `第${i + 1}题: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }

    return { success, failed, errors };
  }

  async attachKnowledgePoints(
    questionId: number,
    kpDtos: KnowledgePointDto[],
  ): Promise<void> {
    const question = await this.findOne(questionId);

    const existingKps = await this.questionKnowledgeRepository.find({
      where: { questionId },
    });
    const existingKpIds = new Set(existingKps.map((k) => k.knowledgePointId));

    const kpEntities: QuestionKnowledge[] = [];
    for (const kpDto of kpDtos) {
      if (existingKpIds.has(kpDto.knowledgePointId)) {
        continue;
      }
      kpEntities.push(
        this.questionKnowledgeRepository.create({
          questionId: question.id,
          knowledgePointId: kpDto.knowledgePointId,
          masteryLevel: kpDto.masteryLevel ?? 1,
          weight: kpDto.weight ?? 1.0,
          isPrimary: kpDto.isPrimary ?? 0,
        }),
      );
    }

    if (kpEntities.length > 0) {
      await this.questionKnowledgeRepository.save(kpEntities);
    }
  }

  async detachKnowledgePoint(questionId: number, kpId: number): Promise<void> {
    await this.findOne(questionId);
    const result = await this.questionKnowledgeRepository.delete({
      questionId,
      knowledgePointId: kpId,
    });
    if (result.affected === 0) {
      throw new NotFoundException('知识点关联不存在');
    }
  }

  async findByIds(ids: number[]): Promise<Question[]> {
    return this.questionRepository.findBy({ id: In(ids) });
  }
}
