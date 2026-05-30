import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { KnowledgeMastery } from '../../entities/knowledge-mastery.entity';
import { MasteryHistory } from '../../entities/mastery-history.entity';
import { WeakPoint } from '../../entities/weak-point.entity';
import { KnowledgePoint } from '../../entities/knowledge-point.entity';
import { AnswerRecord } from '../../entities/answer-record.entity';
import { QuestionKnowledge } from '../../entities/question-knowledge.entity';
import { ClassStudent } from '../../entities/class-student.entity';
import { ClassEntity } from '../../entities/class.entity';
import { User } from '../../entities/user.entity';
import { QueryMasteryDto } from './dto/query-mastery.dto';
import { MasteryCalculatorService } from '../../common/services/mastery-calculator.service';
import {
  PaginationResult,
  UserRole,
  MasteryTrend,
} from '../../common/types';
import type { RequestUser } from '../../common/types';

@Injectable()
export class MasteryService {
  private readonly logger = new Logger(MasteryService.name);

  constructor(
    @InjectRepository(KnowledgeMastery)
    private readonly knowledgeMasteryRepository: Repository<KnowledgeMastery>,
    @InjectRepository(MasteryHistory)
    private readonly masteryHistoryRepository: Repository<MasteryHistory>,
    @InjectRepository(KnowledgePoint)
    private readonly knowledgePointRepository: Repository<KnowledgePoint>,
    @InjectRepository(AnswerRecord)
    private readonly answerRecordRepository: Repository<AnswerRecord>,
    @InjectRepository(QuestionKnowledge)
    private readonly questionKnowledgeRepository: Repository<QuestionKnowledge>,
    @InjectRepository(ClassStudent)
    private readonly classStudentRepository: Repository<ClassStudent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly masteryCalculatorService: MasteryCalculatorService,
  ) {}

  async getMyMasteryList(
    queryDto: QueryMasteryDto,
    currentUser: RequestUser,
  ): Promise<PaginationResult<KnowledgeMastery>> {
    const studentId = this.resolveStudentId(queryDto.studentId, currentUser);
    await this.checkAccessPermission(studentId, currentUser);

    const page = queryDto.page ?? 1;
    const pageSize = queryDto.pageSize ?? 20;
    const { subjectId, masteryTrend, minMasteryLevel, maxMasteryLevel, keyword } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.knowledgeMasteryRepository
      .createQueryBuilder('km')
      .leftJoinAndSelect('km.knowledgePoint', 'knowledgePoint')
      .leftJoinAndSelect('km.subject', 'subject')
      .where('km.studentId = :studentId', { studentId });

    if (subjectId) {
      queryBuilder.andWhere('km.subjectId = :subjectId', { subjectId });
    }

    if (masteryTrend) {
      queryBuilder.andWhere('km.masteryTrend = :masteryTrend', { masteryTrend });
    }

    if (minMasteryLevel !== undefined) {
      queryBuilder.andWhere('km.masteryLevel >= :minMasteryLevel', { minMasteryLevel });
    }

    if (maxMasteryLevel !== undefined) {
      queryBuilder.andWhere('km.masteryLevel <= :maxMasteryLevel', { maxMasteryLevel });
    }

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('knowledgePoint.name LIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('knowledgePoint.code LIKE :keyword', { keyword: `%${keyword}%` });
        }),
      );
    }

    const [list, total] = await queryBuilder
      .orderBy('km.masteryLevel', 'ASC')
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

  async getSubjectMasteryDetail(
    subjectId: number,
    currentUser: RequestUser,
    studentId?: number,
  ): Promise<any> {
    const targetStudentId = this.resolveStudentId(studentId, currentUser);
    await this.checkAccessPermission(targetStudentId, currentUser);

    const knowledgePoints = await this.knowledgePointRepository.find({
      where: { subjectId, status: 1 },
      order: { depth: 'ASC', sortOrder: 'ASC' },
    });

    const masteryMap = new Map<number, KnowledgeMastery>();
    const masteries = await this.knowledgeMasteryRepository.find({
      where: { studentId: targetStudentId, subjectId },
    });
    masteries.forEach((m) => masteryMap.set(m.knowledgePointId, m));

    const tree = this.buildKnowledgeTree(knowledgePoints, masteryMap);

    const overallStats = this.calculateOverallStats(masteries);

    return {
      subjectId,
      studentId: targetStudentId,
      overallStats,
      knowledgeTree: tree,
    };
  }

  async getKnowledgePointMasteryDetail(
    kpId: number,
    currentUser: RequestUser,
    studentId?: number,
  ): Promise<any> {
    const targetStudentId = this.resolveStudentId(studentId, currentUser);
    await this.checkAccessPermission(targetStudentId, currentUser);

    const knowledgePoint = await this.knowledgePointRepository.findOne({
      where: { id: kpId, status: 1 },
    });
    if (!knowledgePoint) {
      throw new NotFoundException('知识点不存在');
    }

    const mastery = await this.knowledgeMasteryRepository.findOne({
      where: { studentId: targetStudentId, knowledgePointId: kpId },
    });

    if (!mastery) {
      return {
        knowledgePoint,
        mastery: null,
        calculationDetails: null,
        recentAnswers: [],
      };
    }

    const recentAnswers = await this.getRecentAnswersForKnowledgePoint(
      targetStudentId,
      kpId,
      10,
    );

    return {
      knowledgePoint,
      mastery,
      calculationDetails: mastery.calculationDetails,
      recentAnswers,
    };
  }

  async getMasteryHeatmap(
    subjectId: number,
    currentUser: RequestUser,
    studentId?: number,
  ): Promise<any> {
    const targetStudentId = this.resolveStudentId(studentId, currentUser);
    await this.checkAccessPermission(targetStudentId, currentUser);

    const knowledgePoints = await this.knowledgePointRepository.find({
      where: { subjectId, status: 1 },
    });

    const masteries = await this.knowledgeMasteryRepository.find({
      where: { studentId: targetStudentId, subjectId },
    });

    const masteryMap = new Map<number, KnowledgeMastery>();
    masteries.forEach((m) => masteryMap.set(m.knowledgePointId, m));

    const heatmapData = knowledgePoints.map((kp) => {
      const mastery = masteryMap.get(kp.id);
      return {
        knowledgePointId: kp.id,
        name: kp.name,
        code: kp.code,
        depth: kp.depth,
        parentId: kp.parentId,
        masteryLevel: mastery?.masteryLevel ?? 0,
        confidence: mastery?.confidence ?? 0,
        totalQuestions: mastery?.totalQuestions ?? 0,
        color: this.getMasteryColor(mastery?.masteryLevel ?? 0),
      };
    });

    return {
      subjectId,
      studentId: targetStudentId,
      heatmapData,
      stats: this.calculateOverallStats(masteries),
    };
  }

  async recalculateStudentMastery(
    studentId: number,
    currentUser: RequestUser,
  ): Promise<{ updated: number; message: string }> {
    if (currentUser.role === UserRole.STUDENT) {
      throw new ForbiddenException('学生无权重新计算掌握度');
    }

    if (currentUser.role === UserRole.TEACHER) {
      const isMyStudent = await this.isTeacherStudent(currentUser.id, studentId);
      if (!isMyStudent) {
        throw new ForbiddenException('只能重新计算所教班级学生的掌握度');
      }
    }

    const student = await this.userRepository.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException('学生不存在');
    }

    const answerRecords = await this.answerRecordRepository
      .createQueryBuilder('ar')
      .leftJoinAndSelect('ar.question', 'question')
      .where('ar.studentId = :studentId', { studentId })
      .andWhere('ar.isCorrect IS NOT NULL')
      .orderBy('ar.submitTime', 'ASC')
      .getMany();

    const kpAnswerMap = new Map<number, AnswerRecord[]>();

    for (const record of answerRecords) {
      const qks = await this.questionKnowledgeRepository.find({
        where: { questionId: record.questionId },
      });
      for (const qk of qks) {
        if (!kpAnswerMap.has(qk.knowledgePointId)) {
          kpAnswerMap.set(qk.knowledgePointId, []);
        }
        kpAnswerMap.get(qk.knowledgePointId)!.push(record);
      }
    }

    let updatedCount = 0;
    for (const [kpId, records] of kpAnswerMap) {
      const kp = await this.knowledgePointRepository.findOne({
        where: { id: kpId },
      });
      if (!kp) continue;

      await this.recalculateMasteryForKnowledgePoint(
        studentId,
        kpId,
        kp.subjectId,
        records,
      );
      updatedCount++;
    }

    await this.createDailySnapshot(studentId);

    return {
      updated: updatedCount,
      message: `成功重新计算 ${updatedCount} 个知识点的掌握度`,
    };
  }

  async getMasteryHistory(
    kpId: number,
    currentUser: RequestUser,
    studentId?: number,
    days: number = 30,
  ): Promise<any> {
    const targetStudentId = this.resolveStudentId(studentId, currentUser);
    await this.checkAccessPermission(targetStudentId, currentUser);

    const knowledgePoint = await this.knowledgePointRepository.findOne({
      where: { id: kpId, status: 1 },
    });
    if (!knowledgePoint) {
      throw new NotFoundException('知识点不存在');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await this.masteryHistoryRepository
      .createQueryBuilder('mh')
      .where('mh.studentId = :studentId', { studentId: targetStudentId })
      .andWhere('mh.knowledgePointId = :kpId', { kpId })
      .andWhere('mh.recordDate >= :startDate', { startDate })
      .orderBy('mh.recordDate', 'ASC')
      .getMany();

    const currentMastery = await this.knowledgeMasteryRepository.findOne({
      where: { studentId: targetStudentId, knowledgePointId: kpId },
    });

    return {
      knowledgePoint,
      history: history.map((h) => ({
        date: h.recordDate,
        masteryLevel: h.masteryLevel,
        totalQuestions: h.totalQuestions,
        correctCount: h.correctCount,
      })),
      currentMastery: currentMastery?.masteryLevel ?? 0,
      trend: this.calculateTrend(history),
    };
  }

  async updateMasteryAfterAnswer(answerRecord: AnswerRecord): Promise<void> {
    try {
      const questionKnowledges = await this.questionKnowledgeRepository.find({
        where: { questionId: answerRecord.questionId },
      });

      for (const qk of questionKnowledges) {
        await this.updateSingleMastery(
          answerRecord.studentId,
          qk.knowledgePointId,
          answerRecord.subjectId,
          answerRecord,
          qk.weight,
        );
      }

      await this.detectWeakPoints(answerRecord.studentId, answerRecord.subjectId);
    } catch (error) {
      this.logger.error(`更新掌握度失败: ${error.message}`, error.stack);
    }
  }

  private async updateSingleMastery(
    studentId: number,
    knowledgePointId: number,
    subjectId: number,
    answerRecord: AnswerRecord,
    weight: number = 1,
  ): Promise<void> {
    let mastery = await this.knowledgeMasteryRepository.findOne({
      where: { studentId, knowledgePointId },
    });

    if (!mastery) {
      mastery = new KnowledgeMastery();
      mastery.studentId = studentId;
      mastery.knowledgePointId = knowledgePointId;
      mastery.subjectId = subjectId;
      mastery.masteryLevel = 50;
      mastery.confidence = 0;
      mastery.totalQuestions = 0;
      mastery.correctCount = 0;
      mastery.wrongCount = 0;
      mastery.streak = 0;
      mastery.forgettingCurve = 1;
      mastery.masteryTrend = MasteryTrend.STABLE;
      mastery.firstAnswerTime = answerRecord.submitTime;
    }

    const recentAnswers = await this.getRecentAnswersForKnowledgePoint(
      studentId,
      knowledgePointId,
      20,
    );

    const historicalMastery = await this.masteryHistoryRepository
      .createQueryBuilder('mh')
      .where('mh.studentId = :studentId', { studentId })
      .andWhere('mh.knowledgePointId = :knowledgePointId', { knowledgePointId })
      .orderBy('mh.recordDate', 'ASC')
      .limit(7)
      .getMany();

    const knowledgePoint = await this.knowledgePointRepository.findOne({
      where: { id: knowledgePointId },
    });

    const isCorrect = answerRecord.isCorrect === 1;
    const currentMastery = mastery.masteryLevel;
    const totalQuestions = mastery.totalQuestions;
    const correctCount = mastery.correctCount;
    const wrongCount = mastery.wrongCount;

    const calculationInput = {
      studentId,
      knowledgePointId,
      currentMastery,
      totalQuestions,
      correctCount,
      wrongCount,
      lastAnswerTime: mastery.lastAnswerTime,
      firstAnswerTime: mastery.firstAnswerTime,
      recentAnswers: recentAnswers.map((ra) => ({
        isCorrect: ra.isCorrect!,
        difficulty: knowledgePoint?.difficultyLevel ?? 3,
        masteryLevel: currentMastery,
        weight,
        timeSpent: ra.timeSpent,
        answerTime: ra.submitTime,
      })),
      historicalMastery: historicalMastery.map((h) => ({
        date: h.recordDate,
        level: h.masteryLevel,
      })),
      questionDifficulty: knowledgePoint?.difficultyLevel ?? 3,
      questionWeight: weight,
      isCorrect,
    };

    const result = this.masteryCalculatorService.calculate(calculationInput);

    mastery.masteryLevel = result.masteryLevel;
    mastery.confidence = result.confidence;
    mastery.totalQuestions += 1;
    if (isCorrect) {
      mastery.correctCount += 1;
    } else {
      mastery.wrongCount += 1;
    }
    mastery.streak = result.streak;
    mastery.forgettingCurve = result.forgettingCurve;
    mastery.masteryTrend = result.masteryTrend as MasteryTrend;
    mastery.lastAnswerTime = answerRecord.submitTime;
    mastery.calculationDetails = result.calculationDetails;
    mastery.modelVersion = 'v1.0';

    await this.knowledgeMasteryRepository.save(mastery);

    await this.updateMasteryHistory(studentId, knowledgePointId, subjectId, mastery);
  }

  private async recalculateMasteryForKnowledgePoint(
    studentId: number,
    knowledgePointId: number,
    subjectId: number,
    records: AnswerRecord[],
  ): Promise<void> {
    let mastery = await this.knowledgeMasteryRepository.findOne({
      where: { studentId, knowledgePointId },
    });

    if (!mastery) {
      mastery = new KnowledgeMastery();
      mastery.studentId = studentId;
      mastery.knowledgePointId = knowledgePointId;
      mastery.subjectId = subjectId;
      mastery.masteryLevel = 50;
      mastery.confidence = 0;
      mastery.totalQuestions = 0;
      mastery.correctCount = 0;
      mastery.wrongCount = 0;
      mastery.streak = 0;
      mastery.forgettingCurve = 1;
      mastery.masteryTrend = MasteryTrend.STABLE;
    }

    const knowledgePoint = await this.knowledgePointRepository.findOne({
      where: { id: knowledgePointId },
    });

    for (const record of records) {
      const isCorrect = record.isCorrect === 1;
      const qks = await this.questionKnowledgeRepository.find({
        where: { questionId: record.questionId, knowledgePointId },
      });
      const weight = qks[0]?.weight ?? 1;

      const calculationInput = {
        studentId,
        knowledgePointId,
        currentMastery: mastery.masteryLevel,
        totalQuestions: mastery.totalQuestions,
        correctCount: mastery.correctCount,
        wrongCount: mastery.wrongCount,
        lastAnswerTime: mastery.lastAnswerTime,
        firstAnswerTime: mastery.firstAnswerTime || record.submitTime,
        recentAnswers: [],
        historicalMastery: [],
        questionDifficulty: knowledgePoint?.difficultyLevel ?? 3,
        questionWeight: weight,
        isCorrect,
      };

      const result = this.masteryCalculatorService.calculate(calculationInput);

      mastery.masteryLevel = result.masteryLevel;
      mastery.confidence = result.confidence;
      mastery.totalQuestions += 1;
      if (isCorrect) {
        mastery.correctCount += 1;
      } else {
        mastery.wrongCount += 1;
      }
      mastery.streak = result.streak;
      mastery.forgettingCurve = result.forgettingCurve;
      mastery.masteryTrend = result.masteryTrend as MasteryTrend;
      mastery.lastAnswerTime = record.submitTime;
      if (!mastery.firstAnswerTime) {
        mastery.firstAnswerTime = record.submitTime;
      }
      mastery.calculationDetails = result.calculationDetails;
    }

    await this.knowledgeMasteryRepository.save(mastery);
  }

  private async updateMasteryHistory(
    studentId: number,
    knowledgePointId: number,
    subjectId: number,
    mastery: KnowledgeMastery,
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let history = await this.masteryHistoryRepository.findOne({
      where: {
        studentId,
        knowledgePointId,
        recordDate: today,
      },
    });

    if (!history) {
      history = new MasteryHistory();
      history.studentId = studentId;
      history.knowledgePointId = knowledgePointId;
      history.subjectId = subjectId;
      history.recordDate = today;
    }

    history.masteryLevel = mastery.masteryLevel;
    history.totalQuestions = mastery.totalQuestions;
    history.correctCount = mastery.correctCount;

    await this.masteryHistoryRepository.save(history);
  }

  private async createDailySnapshot(studentId: number): Promise<void> {
    const masteries = await this.knowledgeMasteryRepository.find({
      where: { studentId },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const mastery of masteries) {
      let history = await this.masteryHistoryRepository.findOne({
        where: {
          studentId,
          knowledgePointId: mastery.knowledgePointId,
          recordDate: today,
        },
      });

      if (!history) {
        history = new MasteryHistory();
        history.studentId = studentId;
        history.knowledgePointId = mastery.knowledgePointId;
        history.subjectId = mastery.subjectId;
        history.recordDate = today;
      }

      history.masteryLevel = mastery.masteryLevel;
      history.totalQuestions = mastery.totalQuestions;
      history.correctCount = mastery.correctCount;

      await this.masteryHistoryRepository.save(history);
    }
  }

  private async getRecentAnswersForKnowledgePoint(
    studentId: number,
    knowledgePointId: number,
    limit: number,
  ): Promise<AnswerRecord[]> {
    const questionKnowledges = await this.questionKnowledgeRepository
      .createQueryBuilder('qk')
      .select(['qk.questionId'])
      .where('qk.knowledgePointId = :knowledgePointId', { knowledgePointId })
      .getMany();
    const questionIds = questionKnowledges.map((qk) => qk.questionId);

    if (questionIds.length === 0) {
      return [];
    }

    return this.answerRecordRepository.find({
      where: {
        studentId,
        questionId: In(questionIds),
        isCorrect: In([0, 1]),
      },
      order: { submitTime: 'DESC' },
      take: limit,
    });
  }

  private async detectWeakPoints(studentId: number, subjectId: number): Promise<void> {
    const masteries = await this.knowledgeMasteryRepository.find({
      where: { studentId, subjectId },
    });

    const weakPointRepository = this.knowledgeMasteryRepository.manager.getRepository(WeakPoint);

    for (const mastery of masteries) {
      const knowledgePoint = await this.knowledgePointRepository.findOne({
        where: { id: mastery.knowledgePointId },
      });
      if (!knowledgePoint) continue;

      const recentWrongCount = await this.getRecentWrongCount(
        studentId,
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
          weakPointRepository,
          studentId,
          mastery.knowledgePointId,
          subjectId,
          result,
        );
      }
    }
  }

  private async createOrUpdateWeakPoint(
    weakPointRepository: Repository<WeakPoint>,
    studentId: number,
    knowledgePointId: number,
    subjectId: number,
    result: any,
  ): Promise<void> {
    let weakPoint = await weakPointRepository.findOne({
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

    await weakPointRepository.save(weakPoint);
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

  private buildKnowledgeTree(
    knowledgePoints: KnowledgePoint[],
    masteryMap: Map<number, KnowledgeMastery>,
  ): any[] {
    const nodeMap = new Map<number, any>();
    const roots: any[] = [];

    for (const kp of knowledgePoints) {
      const mastery = masteryMap.get(kp.id);
      const node = {
        id: kp.id,
        name: kp.name,
        code: kp.code,
        depth: kp.depth,
        parentId: kp.parentId,
        description: kp.description,
        difficultyLevel: kp.difficultyLevel,
        importanceLevel: kp.importanceLevel,
        masteryLevel: mastery?.masteryLevel ?? null,
        confidence: mastery?.confidence ?? null,
        masteryTrend: mastery?.masteryTrend ?? null,
        totalQuestions: mastery?.totalQuestions ?? 0,
        correctCount: mastery?.correctCount ?? 0,
        wrongCount: mastery?.wrongCount ?? 0,
        children: [],
      };
      nodeMap.set(kp.id, node);
    }

    for (const node of nodeMap.values()) {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  private calculateOverallStats(masteries: KnowledgeMastery[]): any {
    if (masteries.length === 0) {
      return {
        averageMastery: 0,
        masteredCount: 0,
        learningCount: 0,
        weakCount: 0,
        totalCount: 0,
      };
    }

    const totalMastery = masteries.reduce((sum, m) => sum + m.masteryLevel, 0);
    const averageMastery = totalMastery / masteries.length;

    const masteredCount = masteries.filter((m) => m.masteryLevel >= 80).length;
    const learningCount = masteries.filter(
      (m) => m.masteryLevel >= 40 && m.masteryLevel < 80,
    ).length;
    const weakCount = masteries.filter((m) => m.masteryLevel < 40).length;

    return {
      averageMastery: Math.round(averageMastery * 100) / 100,
      masteredCount,
      learningCount,
      weakCount,
      totalCount: masteries.length,
    };
  }

  private getMasteryColor(masteryLevel: number): string {
    if (masteryLevel >= 80) return '#52c41a';
    if (masteryLevel >= 60) return '#1890ff';
    if (masteryLevel >= 40) return '#faad14';
    if (masteryLevel >= 20) return '#fa8c16';
    return '#f5222d';
  }

  private calculateTrend(history: MasteryHistory[]): string {
    if (history.length < 2) return 'stable';

    const recent = history.slice(-5);
    const values = recent.map((h) => h.masteryLevel);

    let increasing = 0;
    let decreasing = 0;

    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1]) increasing++;
      else if (values[i] < values[i - 1]) decreasing++;
    }

    if (increasing > decreasing) return 'improving';
    if (decreasing > increasing) return 'declining';
    return 'stable';
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
        throw new ForbiddenException('无权查看其他学生的掌握度');
      }
      return;
    }

    if (currentUser.role === UserRole.TEACHER) {
      const isMyStudent = await this.isTeacherStudent(
        currentUser.id,
        targetStudentId,
      );
      if (!isMyStudent) {
        throw new ForbiddenException('只能查看所教班级学生的掌握度');
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
