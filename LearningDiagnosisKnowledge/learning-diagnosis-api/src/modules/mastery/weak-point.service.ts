import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeakPoint } from '../../entities/weak-point.entity';
import { KnowledgeMastery } from '../../entities/knowledge-mastery.entity';
import { KnowledgePoint } from '../../entities/knowledge-point.entity';
import { AnswerRecord } from '../../entities/answer-record.entity';
import { QuestionKnowledge } from '../../entities/question-knowledge.entity';
import { ClassStudent } from '../../entities/class-student.entity';
import { QueryMasteryDto } from './dto/query-mastery.dto';
import { MasteryCalculatorService } from '../../common/services/mastery-calculator.service';
import {
  PaginationResult,
  UserRole,
  WeaknessLevel,
} from '../../common/types';
import type { RequestUser } from '../../common/types';

@Injectable()
export class WeakPointService {
  private readonly logger = new Logger(WeakPointService.name);

  constructor(
    @InjectRepository(WeakPoint)
    private readonly weakPointRepository: Repository<WeakPoint>,
    @InjectRepository(KnowledgeMastery)
    private readonly knowledgeMasteryRepository: Repository<KnowledgeMastery>,
    @InjectRepository(KnowledgePoint)
    private readonly knowledgePointRepository: Repository<KnowledgePoint>,
    @InjectRepository(AnswerRecord)
    private readonly answerRecordRepository: Repository<AnswerRecord>,
    @InjectRepository(QuestionKnowledge)
    private readonly questionKnowledgeRepository: Repository<QuestionKnowledge>,
    @InjectRepository(ClassStudent)
    private readonly classStudentRepository: Repository<ClassStudent>,
    private readonly masteryCalculatorService: MasteryCalculatorService,
  ) {}

  async getMyWeakPoints(
    queryDto: QueryMasteryDto,
    currentUser: RequestUser,
  ): Promise<PaginationResult<WeakPoint>> {
    const studentId = this.resolveStudentId(queryDto.studentId, currentUser);
    await this.checkAccessPermission(studentId, currentUser);

    const page = queryDto.page ?? 1;
    const pageSize = queryDto.pageSize ?? 20;
    const { subjectId } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.weakPointRepository
      .createQueryBuilder('wp')
      .leftJoinAndSelect('wp.knowledgePoint', 'knowledgePoint')
      .leftJoinAndSelect('wp.subject', 'subject')
      .where('wp.studentId = :studentId', { studentId })
      .andWhere('wp.isResolved = 0');

    if (subjectId) {
      queryBuilder.andWhere('wp.subjectId = :subjectId', { subjectId });
    }

    const [list, total] = await queryBuilder
      .orderBy('wp.weaknessScore', 'DESC')
      .addOrderBy('wp.detectedAt', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  async getWeakPointDetail(
    id: number,
    currentUser: RequestUser,
  ): Promise<WeakPoint> {
    const weakPoint = await this.weakPointRepository
      .createQueryBuilder('wp')
      .leftJoinAndSelect('wp.knowledgePoint', 'knowledgePoint')
      .leftJoinAndSelect('wp.subject', 'subject')
      .where('wp.id = :id', { id })
      .getOne();

    if (!weakPoint) {
      throw new NotFoundException('薄弱点不存在');
    }

    await this.checkAccessPermission(weakPoint.studentId, currentUser);

    return weakPoint;
  }

  async refreshWeakPoints(
    currentUser: RequestUser,
    studentId?: number,
  ): Promise<{ updated: number; message: string }> {
    const targetStudentId = this.resolveStudentId(studentId, currentUser);
    await this.checkAccessPermission(targetStudentId, currentUser);

    const masteries = await this.knowledgeMasteryRepository.find({
      where: { studentId: targetStudentId },
    });

    let updatedCount = 0;

    for (const mastery of masteries) {
      const knowledgePoint = await this.knowledgePointRepository.findOne({
        where: { id: mastery.knowledgePointId },
      });
      if (!knowledgePoint) continue;

      const recentWrongCount = await this.getRecentWrongCount(
        targetStudentId,
        mastery.knowledgePointId,
        7,
      );

      const result = this.masteryCalculatorService.calculateWeaknessScore(
        mastery.masteryLevel,
        recentWrongCount,
        mastery.totalQuestions,
        knowledgePoint.importanceLevel,
        mastery.lastAnswerTime,
      );

      if (result.score >= 30) {
        await this.createOrUpdateWeakPoint(
          targetStudentId,
          mastery.knowledgePointId,
          mastery.subjectId,
          result,
        );
        updatedCount++;
      } else {
        await this.resolveWeakPointIfNeeded(
          targetStudentId,
          mastery.knowledgePointId,
          result,
        );
      }
    }

    return {
      updated: updatedCount,
      message: `成功刷新薄弱点检测，共检测到 ${updatedCount} 个薄弱知识点`,
    };
  }

  async getWeakPointStatistics(
    currentUser: RequestUser,
    studentId?: number,
  ): Promise<any> {
    const targetStudentId = this.resolveStudentId(studentId, currentUser);
    await this.checkAccessPermission(targetStudentId, currentUser);

    const weakPoints = await this.weakPointRepository
      .createQueryBuilder('wp')
      .leftJoinAndSelect('wp.subject', 'subject')
      .where('wp.studentId = :studentId', { studentId: targetStudentId })
      .andWhere('wp.isResolved = 0')
      .getMany();

    const stats = {
      total: weakPoints.length,
      byLevel: {
        [WeaknessLevel.CRITICAL]: 0,
        [WeaknessLevel.HIGH]: 0,
        [WeaknessLevel.MEDIUM]: 0,
        [WeaknessLevel.LOW]: 0,
      },
      bySubject: new Map<string, { count: number; avgScore: number }>(),
      improvingCount: 0,
      needsAttentionCount: 0,
      averageScore: 0,
    };

    if (weakPoints.length === 0) {
      return {
        ...stats,
        bySubject: {},
      };
    }

    let totalScore = 0;

    for (const wp of weakPoints) {
      stats.byLevel[wp.weaknessLevel]++;
      totalScore += wp.weaknessScore;

      if (wp.isImproving === 1) {
        stats.improvingCount++;
      }

      if (wp.weaknessLevel === WeaknessLevel.CRITICAL || wp.weaknessLevel === WeaknessLevel.HIGH) {
        stats.needsAttentionCount++;
      }

      const subjectName = wp.subject?.name || '未知学科';
      if (!stats.bySubject.has(subjectName)) {
        stats.bySubject.set(subjectName, { count: 0, avgScore: 0 });
      }
      const subjectStats = stats.bySubject.get(subjectName)!;
      subjectStats.count++;
      subjectStats.avgScore += wp.weaknessScore;
    }

    stats.averageScore = Math.round((totalScore / weakPoints.length) * 100) / 100;

    const bySubjectObj: any = {};
    for (const [subjectName, subjectStats] of stats.bySubject) {
      bySubjectObj[subjectName] = {
        count: subjectStats.count,
        avgScore: Math.round((subjectStats.avgScore / subjectStats.count) * 100) / 100,
      };
    }

    return {
      ...stats,
      bySubject: bySubjectObj,
    };
  }

  private async createOrUpdateWeakPoint(
    studentId: number,
    knowledgePointId: number,
    subjectId: number,
    result: any,
  ): Promise<void> {
    let weakPoint = await this.weakPointRepository.findOne({
      where: {
        studentId,
        knowledgePointId,
        isResolved: 0,
      },
    });

    const relatedWrongQuestions = await this.getRelatedWrongQuestions(
      studentId,
      knowledgePointId,
    );

    if (!weakPoint) {
      weakPoint = new WeakPoint();
      weakPoint.studentId = studentId;
      weakPoint.knowledgePointId = knowledgePointId;
      weakPoint.subjectId = subjectId;
      weakPoint.detectedAt = new Date();
      weakPoint.practiceSinceDetected = 0;
      weakPoint.recommendedPracticeCount = this.getRecommendedPracticeCount(result.level);
    }

    const previousScore = weakPoint.weaknessScore;
    weakPoint.weaknessScore = result.score;
    weakPoint.weaknessLevel = result.level;
    weakPoint.reason = result.reason;
    weakPoint.relatedWrongQuestions = relatedWrongQuestions;
    weakPoint.lastUpdatedAt = new Date();
    weakPoint.improvementSinceDetected = previousScore
      ? previousScore - result.score
      : 0;
    weakPoint.isImproving = weakPoint.improvementSinceDetected > 0 ? 1 : 0;

    await this.weakPointRepository.save(weakPoint);
  }

  private async resolveWeakPointIfNeeded(
    studentId: number,
    knowledgePointId: number,
    result: any,
  ): Promise<void> {
    const weakPoint = await this.weakPointRepository.findOne({
      where: {
        studentId,
        knowledgePointId,
        isResolved: 0,
      },
    });

    if (weakPoint && result.score < 20) {
      weakPoint.isResolved = 1;
      weakPoint.resolvedAt = new Date();
      await this.weakPointRepository.save(weakPoint);
    }
  }

  private async getRecentWrongCount(
    studentId: number,
    knowledgePointId: number,
    days: number,
  ): Promise<number> {
    const questionKnowledges = await this.questionKnowledgeRepository
      .createQueryBuilder('qk')
      .select(['qk.questionId'])
      .where('qk.knowledgePointId = :knowledgePointId', { knowledgePointId })
      .getMany();
    const questionIds = questionKnowledges.map((qk) => qk.questionId);

    if (questionIds.length === 0) return 0;

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const count = await this.answerRecordRepository
      .createQueryBuilder('ar')
      .where('ar.studentId = :studentId', { studentId })
      .andWhere('ar.questionId IN (:...questionIds)', { questionIds })
      .andWhere('ar.isCorrect = 0')
      .andWhere('ar.submitTime >= :sinceDate', { sinceDate })
      .getCount();

    return count;
  }

  private async getRelatedWrongQuestions(
    studentId: number,
    knowledgePointId: number,
  ): Promise<any[]> {
    const questionKnowledges = await this.questionKnowledgeRepository
      .createQueryBuilder('qk')
      .select(['qk.questionId'])
      .where('qk.knowledgePointId = :knowledgePointId', { knowledgePointId })
      .getMany();
    const questionIds = questionKnowledges.map((qk) => qk.questionId);

    if (questionIds.length === 0) return [];

    const wrongRecords = await this.answerRecordRepository
      .createQueryBuilder('ar')
      .leftJoinAndSelect('ar.question', 'question')
      .where('ar.studentId = :studentId', { studentId })
      .andWhere('ar.questionId IN (:...questionIds)', { questionIds })
      .andWhere('ar.isCorrect = 0')
      .orderBy('ar.submitTime', 'DESC')
      .limit(5)
      .getMany();

    return wrongRecords.map((wr) => ({
      answerRecordId: wr.id,
      questionId: wr.questionId,
      questionContent: wr.question?.content?.substring(0, 100),
      submitTime: wr.submitTime,
      studentAnswer: wr.studentAnswer,
    }));
  }

  private getRecommendedPracticeCount(level: string): number {
    switch (level) {
      case 'critical':
        return 10;
      case 'high':
        return 7;
      case 'medium':
        return 5;
      case 'low':
        return 3;
      default:
        return 5;
    }
  }

  private resolveStudentId(
    studentId: number | undefined,
    currentUser: RequestUser,
  ): number {
    if (currentUser.role === UserRole.STUDENT) {
      return currentUser.id;
    }
    return studentId ?? currentUser.id;
  }

  private async checkAccessPermission(
    targetStudentId: number,
    currentUser: RequestUser,
  ): Promise<void> {
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }

    if (currentUser.role === UserRole.STUDENT) {
      if (targetStudentId !== currentUser.id) {
        throw new ForbiddenException('无权查看其他学生的薄弱点');
      }
      return;
    }

    if (currentUser.role === UserRole.TEACHER) {
      const isMyStudent = await this.isTeacherStudent(
        currentUser.id,
        targetStudentId,
      );
      if (!isMyStudent) {
        throw new ForbiddenException('只能查看所教班级学生的薄弱点');
      }
    }
  }

  private async isTeacherStudent(
    teacherId: number,
    studentId: number,
  ): Promise<boolean> {
    const classes = await this.classStudentRepository
      .createQueryBuilder('cs')
      .leftJoin('cs.class', 'class')
      .where('cs.studentId = :studentId', { studentId })
      .andWhere('class.teacherId = :teacherId', { teacherId })
      .andWhere('cs.isActive = 1')
      .andWhere('class.status = 1')
      .getCount();

    return classes > 0;
  }
}
