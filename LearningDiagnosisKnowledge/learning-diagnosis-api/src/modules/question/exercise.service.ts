import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '../../entities/exercise.entity';
import { ExerciseQuestion } from '../../entities/exercise-question.entity';
import {
  CreateExerciseDto,
  UpdateExerciseDto,
  QueryExerciseDto,
  ExerciseQuestionDto,
} from './dto/create-exercise.dto';
import { PaginationResult } from '../../common/types';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
    @InjectRepository(ExerciseQuestion)
    private readonly exerciseQuestionRepository: Repository<ExerciseQuestion>,
  ) {}

  async findAll(query: QueryExerciseDto): Promise<PaginationResult<Exercise>> {
    const {
      page = 1,
      pageSize = 10,
      subjectId,
      type,
      creatorId,
      keyword,
      isPublic,
      status,
    } = query;
    const qb = this.exerciseRepository.createQueryBuilder('e');

    qb.leftJoinAndSelect('e.subject', 's').leftJoinAndSelect('e.creator', 'c');

    if (subjectId) {
      qb.andWhere('e.subjectId = :subjectId', { subjectId });
    }
    if (type) {
      qb.andWhere('e.type = :type', { type });
    }
    if (creatorId) {
      qb.andWhere('e.creatorId = :creatorId', { creatorId });
    }
    if (keyword) {
      qb.andWhere('e.name LIKE :keyword', { keyword: `%${keyword}%` });
    }
    if (isPublic !== undefined) {
      qb.andWhere('e.isPublic = :isPublic', { isPublic });
    }
    if (status !== undefined) {
      qb.andWhere('e.status = :status', { status });
    }

    qb.orderBy('e.createdAt', 'DESC');

    const skip = (page - 1) * pageSize;
    const [list, total] = await qb.skip(skip).take(pageSize).getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findOne(id: number): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findOne({
      where: { id },
      relations: {
        exerciseQuestions: {
          question: {
            questionKnowledges: {
              knowledgePoint: true,
            },
          },
        },
        subject: true,
        creator: true,
      },
      order: {
        exerciseQuestions: {
          sortOrder: 'ASC',
        },
      },
    });
    if (!exercise) {
      throw new NotFoundException('练习不存在');
    }
    return exercise;
  }

  async create(dto: CreateExerciseDto, creatorId?: number): Promise<Exercise> {
    const { questions, ...exerciseData } = dto;

    const exercise = this.exerciseRepository.create({
      ...exerciseData,
      creatorId,
      totalQuestions: questions?.length ?? 0,
    });
    const savedExercise = await this.exerciseRepository.save(exercise);

    if (questions && questions.length > 0) {
      let totalScore = 0;
      for (const q of questions) {
        totalScore += Number(q.score);
      }
      if (dto.totalScore === undefined) {
        savedExercise.totalScore = totalScore;
        await this.exerciseRepository.save(savedExercise);
      }
      await this.addQuestions(savedExercise.id, questions);
    }

    return this.findOne(savedExercise.id);
  }

  async update(id: number, dto: UpdateExerciseDto): Promise<Exercise> {
    await this.findOne(id);
    await this.exerciseRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const exercise = await this.findOne(id);
    await this.exerciseRepository.softDelete(exercise.id);
  }

  async addQuestions(
    exerciseId: number,
    questionDtos: ExerciseQuestionDto[],
  ): Promise<void> {
    const exercise = await this.findOne(exerciseId);

    const existingEqs = await this.exerciseQuestionRepository.find({
      where: { exerciseId },
    });
    const existingQIds = new Set(existingEqs.map((eq) => eq.questionId));

    let maxSortOrder = existingEqs.reduce(
      (max, eq) => Math.max(max, eq.sortOrder),
      -1,
    );

    const eqEntities: ExerciseQuestion[] = [];
    for (const qDto of questionDtos) {
      if (existingQIds.has(qDto.questionId)) {
        continue;
      }
      eqEntities.push(
        this.exerciseQuestionRepository.create({
          exerciseId: exercise.id,
          questionId: qDto.questionId,
          score: qDto.score,
          sortOrder: qDto.sortOrder ?? ++maxSortOrder,
        }),
      );
    }

    if (eqEntities.length > 0) {
      await this.exerciseQuestionRepository.save(eqEntities);

      const totalQuestions = await this.exerciseQuestionRepository.count({
        where: { exerciseId },
      });
      await this.exerciseRepository.update(exerciseId, { totalQuestions });
    }
  }

  async removeQuestion(exerciseId: number, questionId: number): Promise<void> {
    await this.findOne(exerciseId);

    const result = await this.exerciseQuestionRepository.delete({
      exerciseId,
      questionId,
    });
    if (result.affected === 0) {
      throw new NotFoundException('练习中的题目不存在');
    }

    const totalQuestions = await this.exerciseQuestionRepository.count({
      where: { exerciseId },
    });

    const remainingQuestions = await this.exerciseQuestionRepository.find({
      where: { exerciseId },
      select: { score: true },
    });
    const totalScore = remainingQuestions.reduce(
      (sum, q) => sum + Number(q.score),
      0,
    );

    await this.exerciseRepository.update(exerciseId, {
      totalQuestions,
      totalScore,
    });
  }

  async updateExerciseStats(exerciseId: number): Promise<void> {
    const questions = await this.exerciseQuestionRepository.find({
      where: { exerciseId },
    });

    const totalQuestions = questions.length;
    const totalScore = questions.reduce((sum, q) => sum + Number(q.score), 0);

    await this.exerciseRepository.update(exerciseId, {
      totalQuestions,
      totalScore,
    });
  }
}
