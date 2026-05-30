import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets, LessThan } from 'typeorm';
import { Recommendation } from '../../entities/recommendation.entity';
import { KnowledgeMastery } from '../../entities/knowledge-mastery.entity';
import { WeakPoint } from '../../entities/weak-point.entity';
import { Question } from '../../entities/question.entity';
import { Exercise } from '../../entities/exercise.entity';
import { QuestionKnowledge } from '../../entities/question-knowledge.entity';
import { KnowledgePoint } from '../../entities/knowledge-point.entity';
import { KnowledgeRelation } from '../../entities/knowledge-relation.entity';
import { ExerciseQuestion } from '../../entities/exercise-question.entity';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { QueryRecommendationDto } from './dto/query-recommendation.dto';
import {
  RecommendationType,
  PaginationResult,
  RequestUser,
  ExerciseType,
  KnowledgeRelationType,
  QuestionType,
} from '../../common/types';

interface TargetKnowledgePoint {
  id: number;
  name: string;
  masteryLevel: number;
  forgettingCurve?: number;
  weaknessScore?: number;
  reason?: string;
}

interface RecommendationContext {
  studentId: number;
  subjectId: number;
  targetKnowledgePoints: TargetKnowledgePoint[];
  type: RecommendationType;
  totalQuestions: number;
  difficultyRange: string;
  recommendationReason: string;
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private readonly ALGORITHM_VERSION = 'v1.0';
  private readonly FORGETTING_THRESHOLD = 0.7;
  private readonly DEFAULT_QUESTION_COUNT = 10;

  constructor(
    @InjectRepository(Recommendation)
    private readonly recommendationRepository: Repository<Recommendation>,
    @InjectRepository(KnowledgeMastery)
    private readonly knowledgeMasteryRepository: Repository<KnowledgeMastery>,
    @InjectRepository(WeakPoint)
    private readonly weakPointRepository: Repository<WeakPoint>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
    @InjectRepository(QuestionKnowledge)
    private readonly questionKnowledgeRepository: Repository<QuestionKnowledge>,
    @InjectRepository(KnowledgePoint)
    private readonly knowledgePointRepository: Repository<KnowledgePoint>,
    @InjectRepository(KnowledgeRelation)
    private readonly knowledgeRelationRepository: Repository<KnowledgeRelation>,
    @InjectRepository(ExerciseQuestion)
    private readonly exerciseQuestionRepository: Repository<ExerciseQuestion>,
  ) {}

  async getRecommendations(
    queryDto: QueryRecommendationDto,
    currentUser: RequestUser,
  ): Promise<PaginationResult<Recommendation>> {
    const { page = 1, pageSize = 20, subjectId, type, isCompleted } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.recommendationRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.subject', 'subject')
      .leftJoinAndSelect('r.exercise', 'exercise')
      .where('r.studentId = :studentId', { studentId: currentUser.id });

    if (subjectId) {
      queryBuilder.andWhere('r.subjectId = :subjectId', { subjectId });
    }

    if (type) {
      queryBuilder.andWhere('r.type = :type', { type });
    }

    if (isCompleted !== undefined) {
      queryBuilder.andWhere('r.isCompleted = :isCompleted', { isCompleted });
    }

    const [list, total] = await queryBuilder
      .orderBy('r.recommendedAt', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page: page ?? 1,
      pageSize: pageSize ?? 20,
    };
  }

  async getRecommendationDetail(
    id: number,
    currentUser: RequestUser,
  ): Promise<Recommendation> {
    const recommendation = await this.recommendationRepository.findOne({
      where: { id },
      relations: {
        subject: true,
        exercise: {
          exerciseQuestions: {
            question: true,
          },
        },
      },
    });

    if (!recommendation) {
      throw new NotFoundException('推荐练习不存在');
    }

    if (recommendation.studentId !== currentUser.id) {
      throw new ForbiddenException('无权查看他人的推荐练习');
    }

    return recommendation;
  }

  async generateRecommendation(
    createDto: CreateRecommendationDto,
    currentUser: RequestUser,
  ): Promise<Recommendation> {
    const { subjectId, type, totalQuestions, knowledgePointIds } = createDto;
    const questionCount = totalQuestions || this.DEFAULT_QUESTION_COUNT;

    let recommendationType = type;
    if (!recommendationType) {
      recommendationType = await this.determineRecommendationType(
        currentUser.id,
        subjectId,
      );
    }

    const context = await this.buildRecommendationContext(
      currentUser.id,
      subjectId,
      recommendationType,
      questionCount,
      knowledgePointIds,
    );

    const selectedQuestions = await this.selectQuestions(context);

    if (selectedQuestions.length === 0) {
      throw new BadRequestException('未找到符合条件的题目，请调整筛选条件');
    }

    const exercise = await this.createExerciseFromRecommendation(
      context,
      selectedQuestions,
      currentUser,
    );

    const recommendation = new Recommendation();
    recommendation.studentId = currentUser.id;
    recommendation.subjectId = subjectId;
    recommendation.exerciseId = exercise.id;
    recommendation.type = context.type;
    recommendation.targetKnowledgePoints = context.targetKnowledgePoints;
    recommendation.recommendationReason = context.recommendationReason;
    recommendation.totalQuestions = selectedQuestions.length;
    recommendation.difficultyRange = context.difficultyRange;
    recommendation.isCompleted = 0;
    recommendation.recommendedAt = new Date();
    recommendation.algorithmVersion = this.ALGORITHM_VERSION;
    recommendation.expiresAt = this.calculateExpiryDate(context.type);

    const savedRecommendation = await this.recommendationRepository.save(recommendation);

    await this.updateWeakPointPracticeCount(context.targetKnowledgePoints, currentUser.id, subjectId);

    return savedRecommendation;
  }

  async completeRecommendation(
    id: number,
    currentUser: RequestUser,
  ): Promise<Recommendation> {
    const recommendation = await this.recommendationRepository.findOne({
      where: { id },
      relations: {
        exercise: true,
      },
    });

    if (!recommendation) {
      throw new NotFoundException('推荐练习不存在');
    }

    if (recommendation.studentId !== currentUser.id) {
      throw new ForbiddenException('无权操作他人的推荐练习');
    }

    if (recommendation.isCompleted === 1) {
      throw new BadRequestException('该推荐练习已完成');
    }

    recommendation.isCompleted = 1;
    recommendation.completedAt = new Date();

    if (recommendation.exercise && recommendation.exerciseId) {
      const avgScore = await this.calculateExerciseScore(recommendation.exerciseId, currentUser.id);
      recommendation.score = avgScore;
    }

    return this.recommendationRepository.save(recommendation);
  }

  async getStatistics(currentUser: RequestUser): Promise<any> {
    const total = await this.recommendationRepository.count({
      where: { studentId: currentUser.id },
    });

    const completed = await this.recommendationRepository.count({
      where: { studentId: currentUser.id, isCompleted: 1 },
    });

    const pending = total - completed;

    const typeStats = await this.recommendationRepository
      .createQueryBuilder('r')
      .select('r.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(r.isCompleted)', 'completed')
      .where('r.studentId = :studentId', { studentId: currentUser.id })
      .groupBy('r.type')
      .getRawMany();

    const weakPointCount = await this.weakPointRepository.count({
      where: { studentId: currentUser.id, isResolved: 0 },
    });

    const forgettingCount = await this.knowledgeMasteryRepository.count({
      where: {
        studentId: currentUser.id,
        forgettingCurve: LessThan(this.FORGETTING_THRESHOLD),
      },
    });

    const avgScoreResult = await this.recommendationRepository
      .createQueryBuilder('r')
      .select('AVG(r.score)', 'avgScore')
      .where('r.studentId = :studentId', { studentId: currentUser.id })
      .andWhere('r.isCompleted = 1')
      .andWhere('r.score IS NOT NULL')
      .getRawOne();

    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      typeBreakdown: typeStats.map((s) => ({
        type: s.type,
        count: parseInt(s.count),
        completed: parseInt(s.completed),
      })),
      weakPointCount,
      forgettingCount,
      avgScore: avgScoreResult?.avgScore ? parseFloat(avgScoreResult.avgScore) : 0,
    };
  }

  private async determineRecommendationType(
    studentId: number,
    subjectId: number,
  ): Promise<RecommendationType> {
    const weakPointCount = await this.weakPointRepository.count({
      where: { studentId, subjectId, isResolved: 0 },
    });

    const forgettingCount = await this.knowledgeMasteryRepository.count({
      where: {
        studentId,
        subjectId,
        forgettingCurve: LessThan(this.FORGETTING_THRESHOLD),
      },
    });

    if (weakPointCount >= 2) {
      return RecommendationType.WEAK_POINT;
    }

    if (forgettingCount >= 3) {
      return RecommendationType.FORGETTING;
    }

    const totalMastery = await this.knowledgeMasteryRepository.find({
      where: { studentId, subjectId },
    });

    const avgMastery = totalMastery.length > 0
      ? totalMastery.reduce((sum, m) => sum + m.masteryLevel, 0) / totalMastery.length
      : 0;

    if (avgMastery > 80) {
      return RecommendationType.PREVIEW;
    }

    return RecommendationType.COMPREHENSIVE;
  }

  private async buildRecommendationContext(
    studentId: number,
    subjectId: number,
    type: RecommendationType,
    totalQuestions: number,
    knowledgePointIds?: number[],
  ): Promise<RecommendationContext> {
    let targetKnowledgePoints: TargetKnowledgePoint[] = [];
    let recommendationReason = '';
    let difficultyRange = '1-3';

    switch (type) {
      case RecommendationType.WEAK_POINT:
        const weakPoints = await this.getWeakPointTargets(studentId, subjectId, knowledgePointIds);
        targetKnowledgePoints = weakPoints.points;
        recommendationReason = weakPoints.reason;
        difficultyRange = this.calculateDifficultyRange(targetKnowledgePoints, 1);
        break;

      case RecommendationType.FORGETTING:
        const forgetting = await this.getForgettingTargets(studentId, subjectId, knowledgePointIds);
        targetKnowledgePoints = forgetting.points;
        recommendationReason = forgetting.reason;
        difficultyRange = this.calculateDifficultyRange(targetKnowledgePoints, 2);
        break;

      case RecommendationType.PREVIEW:
        const preview = await this.getPreviewTargets(studentId, subjectId, knowledgePointIds);
        targetKnowledgePoints = preview.points;
        recommendationReason = preview.reason;
        difficultyRange = '3-5';
        break;

      case RecommendationType.COMPREHENSIVE:
        const comprehensive = await this.getComprehensiveTargets(studentId, subjectId, knowledgePointIds);
        targetKnowledgePoints = comprehensive.points;
        recommendationReason = comprehensive.reason;
        difficultyRange = this.calculateDifficultyRange(targetKnowledgePoints, 2);
        break;
    }

    if (targetKnowledgePoints.length === 0) {
      throw new BadRequestException('未找到符合条件的知识点，请调整筛选条件');
    }

    return {
      studentId,
      subjectId,
      targetKnowledgePoints,
      type,
      totalQuestions,
      difficultyRange,
      recommendationReason,
    };
  }

  private async getWeakPointTargets(
    studentId: number,
    subjectId: number,
    knowledgePointIds?: number[],
  ): Promise<{ points: TargetKnowledgePoint[]; reason: string }> {
    const queryBuilder = this.weakPointRepository
      .createQueryBuilder('wp')
      .leftJoinAndSelect('wp.knowledgePoint', 'kp')
      .where('wp.studentId = :studentId', { studentId })
      .andWhere('wp.subjectId = :subjectId', { subjectId })
      .andWhere('wp.isResolved = 0');

    if (knowledgePointIds && knowledgePointIds.length > 0) {
      queryBuilder.andWhere('wp.knowledgePointId IN (:...kpIds)', { kpIds: knowledgePointIds });
    }

    const weakPoints = await queryBuilder
      .orderBy('wp.weaknessScore', 'DESC')
      .limit(5)
      .getMany();

    const points: TargetKnowledgePoint[] = weakPoints.map((wp) => ({
      id: wp.knowledgePointId,
      name: wp.knowledgePoint?.name || '',
      masteryLevel: 0,
      weaknessScore: wp.weaknessScore,
      reason: wp.reason || '',
    }));

    const reasons: string[] = [];
    if (points.length > 0) {
      const topPoint = points[0];
      reasons.push(`检测到${points.length}个薄弱知识点`);
      reasons.push(`最薄弱：${topPoint.name}（薄弱度${topPoint.weaknessScore}%）`);
      if (topPoint.reason) {
        reasons.push(topPoint.reason);
      }
    }

    return {
      points,
      reason: reasons.join('；'),
    };
  }

  private async getForgettingTargets(
    studentId: number,
    subjectId: number,
    knowledgePointIds?: number[],
  ): Promise<{ points: TargetKnowledgePoint[]; reason: string }> {
    const queryBuilder = this.knowledgeMasteryRepository
      .createQueryBuilder('km')
      .leftJoinAndSelect('km.knowledgePoint', 'kp')
      .where('km.studentId = :studentId', { studentId })
      .andWhere('km.subjectId = :subjectId', { subjectId })
      .andWhere('km.forgettingCurve < :threshold', { threshold: this.FORGETTING_THRESHOLD });

    if (knowledgePointIds && knowledgePointIds.length > 0) {
      queryBuilder.andWhere('km.knowledgePointId IN (:...kpIds)', { kpIds: knowledgePointIds });
    }

    const masteries = await queryBuilder
      .orderBy('km.forgettingCurve', 'ASC')
      .limit(5)
      .getMany();

    const points: TargetKnowledgePoint[] = masteries.map((km) => ({
      id: km.knowledgePointId,
      name: km.knowledgePoint?.name || '',
      masteryLevel: km.masteryLevel,
      forgettingCurve: km.forgettingCurve,
      reason: this.generateForgettingReason(km),
    }));

    const reasons: string[] = [];
    if (points.length > 0) {
      reasons.push(`检测到${points.length}个知识点记忆保持度低于70%`);
      reasons.push(`根据艾宾浩斯遗忘曲线，建议及时复习`);
      const avgForgetting = points.reduce((sum, p) => sum + (p.forgettingCurve || 0), 0) / points.length;
      reasons.push(`平均记忆保持度${(avgForgetting * 100).toFixed(0)}%`);
    }

    return {
      points,
      reason: reasons.join('；'),
    };
  }

  private async getPreviewTargets(
    studentId: number,
    subjectId: number,
    knowledgePointIds?: number[],
  ): Promise<{ points: TargetKnowledgePoint[]; reason: string }> {
    const masteredKPs = await this.knowledgeMasteryRepository
      .createQueryBuilder('km')
      .where('km.studentId = :studentId', { studentId })
      .andWhere('km.subjectId = :subjectId', { subjectId })
      .andWhere('km.masteryLevel >= 80')
      .getMany();

    const masteredKpIds = masteredKPs.map((m) => m.knowledgePointId);

    let nextKpIds: number[] = [];
    if (masteredKpIds.length > 0) {
      const relations = await this.knowledgeRelationRepository.find({
        where: {
          fromKpId: In(masteredKpIds),
          relationType: KnowledgeRelationType.DERIVED,
        },
      });
      nextKpIds = relations.map((r) => r.toKpId);
    }

    if (nextKpIds.length === 0) {
      const allKps = await this.knowledgePointRepository.find({
        where: { subjectId, status: 1 },
        order: { sortOrder: 'ASC', depth: 'ASC' },
      });
      nextKpIds = allKps
        .filter((kp) => !masteredKpIds.includes(kp.id))
        .slice(0, 5)
        .map((kp) => kp.id);
    }

    if (knowledgePointIds && knowledgePointIds.length > 0) {
      nextKpIds = nextKpIds.filter((id) => knowledgePointIds.includes(id));
    }

    nextKpIds = [...new Set(nextKpIds)].slice(0, 5);

    const knowledgePoints = await this.knowledgePointRepository.find({
      where: { id: In(nextKpIds) },
    });

    const points: TargetKnowledgePoint[] = knowledgePoints.map((kp) => ({
      id: kp.id,
      name: kp.name,
      masteryLevel: 0,
      reason: `前置知识已掌握，建议预习`,
    }));

    const reasons: string[] = [];
    if (points.length > 0) {
      reasons.push(`已掌握${masteredKPs.length}个知识点`);
      reasons.push(`推荐预习${points.length}个新知识点`);
      reasons.push(`包含：${points.slice(0, 3).map((p) => p.name).join('、')}`);
    }

    return {
      points,
      reason: reasons.join('；'),
    };
  }

  private async getComprehensiveTargets(
    studentId: number,
    subjectId: number,
    knowledgePointIds?: number[],
  ): Promise<{ points: TargetKnowledgePoint[]; reason: string }> {
    const queryBuilder = this.knowledgeMasteryRepository
      .createQueryBuilder('km')
      .leftJoinAndSelect('km.knowledgePoint', 'kp')
      .where('km.studentId = :studentId', { studentId })
      .andWhere('km.subjectId = :subjectId', { subjectId });

    if (knowledgePointIds && knowledgePointIds.length > 0) {
      queryBuilder.andWhere('km.knowledgePointId IN (:...kpIds)', { kpIds: knowledgePointIds });
    }

    const masteries = await queryBuilder
      .orderBy('km.masteryLevel', 'ASC')
      .limit(8)
      .getMany();

    const points: TargetKnowledgePoint[] = masteries.map((km) => ({
      id: km.knowledgePointId,
      name: km.knowledgePoint?.name || '',
      masteryLevel: km.masteryLevel,
      forgettingCurve: km.forgettingCurve,
    }));

    const reasons: string[] = [];
    if (points.length > 0) {
      const avgMastery = points.reduce((sum, p) => sum + p.masteryLevel, 0) / points.length;
      reasons.push(`综合复习${points.length}个知识点`);
      reasons.push(`平均掌握度${avgMastery.toFixed(1)}%`);
      reasons.push(`均衡提升各知识点掌握水平`);
    }

    return {
      points,
      reason: reasons.join('；'),
    };
  }

  private async selectQuestions(context: RecommendationContext): Promise<Question[]> {
    const { targetKnowledgePoints, totalQuestions, difficultyRange, type } = context;
    const kpIds = targetKnowledgePoints.map((kp) => kp.id);

    const prerequisiteKps = await this.getPrerequisiteKnowledgePoints(kpIds);
    const allKpIds = [...new Set([...prerequisiteKps, ...kpIds])];

    const availableQuestions = await this.getAvailableQuestions(
      context.studentId,
      context.subjectId,
      allKpIds,
      difficultyRange,
    );

    if (availableQuestions.length === 0) {
      return [];
    }

    const studentAvgDifficulty = await this.calculateStudentAvgDifficulty(context.studentId, context.subjectId);
    const targetDifficulty = Math.min(5, studentAvgDifficulty + 0.5);

    const scoredQuestions = availableQuestions.map((q) => ({
      question: q,
      score: this.calculateQuestionScore(q, targetKnowledgePoints, targetDifficulty, type),
    }));

    scoredQuestions.sort((a, b) => b.score - a.score);

    const selected = this.ensureDiversity(scoredQuestions, totalQuestions);

    return selected;
  }

  private async getPrerequisiteKnowledgePoints(kpIds: number[]): Promise<number[]> {
    const relations = await this.knowledgeRelationRepository.find({
      where: {
        toKpId: In(kpIds),
        relationType: KnowledgeRelationType.PREREQUISITE,
      },
    });

    const prerequisiteIds = relations.map((r) => r.fromKpId);
    const masteryLevels = await this.knowledgeMasteryRepository.find({
      where: { knowledgePointId: In(prerequisiteIds) },
    });

    return masteryLevels
      .filter((m) => m.masteryLevel < 70)
      .map((m) => m.knowledgePointId);
  }

  private async getAvailableQuestions(
    studentId: number,
    subjectId: number,
    kpIds: number[],
    difficultyRange: string,
  ): Promise<Question[]> {
    const [minDiff, maxDiff] = difficultyRange.split('-').map(Number);

    const recentQuestionIds = await this.getRecentAnsweredQuestions(studentId, 7);

    const queryBuilder = this.questionRepository
      .createQueryBuilder('q')
      .innerJoinAndSelect('q.questionKnowledges', 'qk')
      .where('q.subjectId = :subjectId', { subjectId })
      .andWhere('q.status = 1')
      .andWhere('q.difficulty BETWEEN :minDiff AND :maxDiff', { minDiff, maxDiff })
      .andWhere('qk.knowledgePointId IN (:...kpIds)', { kpIds });

    if (recentQuestionIds.length > 0) {
      queryBuilder.andWhere('q.id NOT IN (:...recentIds)', { recentIds: recentQuestionIds });
    }

    return queryBuilder.getMany();
  }

  private async getRecentAnsweredQuestions(studentId: number, days: number): Promise<number[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const answerRecords = await this.questionRepository.manager.query(
      `SELECT DISTINCT question_id FROM answer_records 
       WHERE student_id = ? AND submit_time >= ?`,
      [studentId, cutoffDate],
    );

    return answerRecords.map((r: any) => r.question_id);
  }

  private async calculateStudentAvgDifficulty(studentId: number, subjectId: number): Promise<number> {
    const result = await this.questionRepository.manager.query(
      `SELECT AVG(q.difficulty) as avg_diff 
       FROM answer_records ar
       JOIN questions q ON ar.question_id = q.id
       WHERE ar.student_id = ? AND q.subject_id = ? AND ar.is_correct = 1
       ORDER BY ar.submit_time DESC
       LIMIT 20`,
      [studentId, subjectId],
    );

    return result[0]?.avg_diff || 2;
  }

  private calculateQuestionScore(
    question: Question,
    targetKPs: TargetKnowledgePoint[],
    targetDifficulty: number,
    type: RecommendationType,
  ): number {
    let score = 0;

    const questionKPIds = question.questionKnowledges?.map((qk) => qk.knowledgePointId) || [];
    const matchedKPs = targetKPs.filter((kp) => questionKPIds.includes(kp.id));

    if (matchedKPs.length > 0) {
      const avgMastery = matchedKPs.reduce((sum, kp) => sum + kp.masteryLevel, 0) / matchedKPs.length;

      switch (type) {
        case RecommendationType.WEAK_POINT:
          const weaknessBonus = matchedKPs.reduce((sum, kp) => sum + (kp.weaknessScore || 0), 0) / matchedKPs.length;
          score += weaknessBonus * 0.5;
          score += (100 - avgMastery) * 0.3;
          break;

        case RecommendationType.FORGETTING:
          const forgettingBonus = matchedKPs.reduce((sum, kp) => sum + (1 - (kp.forgettingCurve || 1)), 0) / matchedKPs.length;
          score += forgettingBonus * 100 * 0.5;
          score += (100 - avgMastery) * 0.3;
          break;

        case RecommendationType.PREVIEW:
          score += 50;
          break;

        case RecommendationType.COMPREHENSIVE:
          score += (100 - Math.abs(avgMastery - 60)) * 0.5;
          break;
      }

      score += matchedKPs.length * 10;
    }

    const difficultyDiff = Math.abs(question.difficulty - targetDifficulty);
    score += Math.max(0, 20 - difficultyDiff * 10);

    score += (question.correctRate || 50) * 0.1;

    return score;
  }

  private ensureDiversity(
    scoredQuestions: Array<{ question: Question; score: number }>,
    totalCount: number,
  ): Question[] {
    const selected: Question[] = [];
    const selectedIds = new Set<number>();
    const typeCounts = new Map<QuestionType, number>();
    const kpCounts = new Map<number, number>();

    for (const item of scoredQuestions) {
      if (selected.length >= totalCount) break;

      const { question } = item;

      if (selectedIds.has(question.id)) continue;

      const currentTypeCount = typeCounts.get(question.type) || 0;
      if (currentTypeCount >= Math.ceil(totalCount / 4)) continue;

      const questionKPIds = question.questionKnowledges?.map((qk) => qk.knowledgePointId) || [];
      let overKpLimit = false;
      for (const kpId of questionKPIds) {
        const kpCount = kpCounts.get(kpId) || 0;
        if (kpCount >= Math.ceil(totalCount / 3)) {
          overKpLimit = true;
          break;
        }
      }
      if (overKpLimit) continue;

      selected.push(question);
      selectedIds.add(question.id);
      typeCounts.set(question.type, currentTypeCount + 1);
      for (const kpId of questionKPIds) {
        kpCounts.set(kpId, (kpCounts.get(kpId) || 0) + 1);
      }
    }

    if (selected.length < totalCount) {
      for (const item of scoredQuestions) {
        if (selected.length >= totalCount) break;
        if (!selectedIds.has(item.question.id)) {
          selected.push(item.question);
          selectedIds.add(item.question.id);
        }
      }
    }

    return selected;
  }

  private async createExerciseFromRecommendation(
    context: RecommendationContext,
    questions: Question[],
    currentUser: RequestUser,
  ): Promise<Exercise> {
    const typeNames: Record<RecommendationType, string> = {
      [RecommendationType.WEAK_POINT]: '薄弱点专项',
      [RecommendationType.FORGETTING]: '遗忘复习',
      [RecommendationType.PREVIEW]: '预习练习',
      [RecommendationType.COMPREHENSIVE]: '综合练习',
    };

    const exercise = new Exercise();
    exercise.name = `${typeNames[context.type]} - ${new Date().toLocaleDateString()}`;
    exercise.subjectId = context.subjectId;
    exercise.creatorId = currentUser.id;
    exercise.type = ExerciseType.RECOMMENDATION;
    exercise.description = context.recommendationReason;
    exercise.totalQuestions = questions.length;
    exercise.totalScore = questions.reduce((sum, q) => sum + q.score, 0);
    exercise.isPublic = 0;
    exercise.status = 1;

    const savedExercise = await this.exerciseRepository.save(exercise);

    const exerciseQuestions = questions.map((q, index) => {
      const eq = new ExerciseQuestion();
      eq.exerciseId = savedExercise.id;
      eq.questionId = q.id;
      eq.sortOrder = index + 1;
      eq.score = q.score;
      return eq;
    });

    await this.exerciseQuestionRepository.save(exerciseQuestions);

    return savedExercise;
  }

  private calculateDifficultyRange(
    targetKPs: TargetKnowledgePoint[],
    baseOffset: number,
  ): string {
    if (targetKPs.length === 0) return '2-4';

    const avgMastery = targetKPs.reduce((sum, kp) => sum + kp.masteryLevel, 0) / targetKPs.length;

    let minDiff: number;
    let maxDiff: number;

    if (avgMastery < 40) {
      minDiff = 1;
      maxDiff = 2;
    } else if (avgMastery < 60) {
      minDiff = 2;
      maxDiff = 3;
    } else if (avgMastery < 80) {
      minDiff = 3;
      maxDiff = 4;
    } else {
      minDiff = 4;
      maxDiff = 5;
    }

    return `${minDiff}-${maxDiff}`;
  }

  private calculateExpiryDate(type: RecommendationType): Date {
    const expiry = new Date();

    const reviewIntervals: Record<RecommendationType, number> = {
      [RecommendationType.WEAK_POINT]: 3,
      [RecommendationType.FORGETTING]: 1,
      [RecommendationType.PREVIEW]: 7,
      [RecommendationType.COMPREHENSIVE]: 5,
    };

    expiry.setDate(expiry.getDate() + reviewIntervals[type]);
    return expiry;
  }

  private generateForgettingReason(km: KnowledgeMastery): string {
    const parts: string[] = [];
    parts.push(`记忆保持度${(km.forgettingCurve * 100).toFixed(0)}%`);
    if (km.lastAnswerTime) {
      const days = Math.floor((new Date().getTime() - km.lastAnswerTime.getTime()) / (1000 * 60 * 60 * 24));
      parts.push(`已${days}天未练习`);
    }
    if (km.wrongCount > 0) {
      parts.push(`累计答错${km.wrongCount}题`);
    }
    return parts.join('，');
  }

  private async updateWeakPointPracticeCount(
    targetKPs: TargetKnowledgePoint[],
    studentId: number,
    subjectId: number,
  ): Promise<void> {
    const kpIds = targetKPs.map((kp) => kp.id);

    await this.weakPointRepository
      .createQueryBuilder()
      .update(WeakPoint)
      .set({
        recommendedPracticeCount: () => 'recommended_practice_count + 1',
        lastUpdatedAt: new Date(),
      })
      .where('studentId = :studentId', { studentId })
      .andWhere('subjectId = :subjectId', { subjectId })
      .andWhere('knowledgePointId IN (:...kpIds)', { kpIds })
      .execute();
  }

  private async calculateExerciseScore(exerciseId: number, studentId: number): Promise<number> {
    const result = await this.questionRepository.manager.query(
      `SELECT AVG(score) as avg_score 
       FROM answer_records 
       WHERE exercise_id = ? AND student_id = ? AND score IS NOT NULL`,
      [exerciseId, studentId],
    );

    return result[0]?.avg_score ? parseFloat(result[0].avg_score) : 0;
  }
}
