import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { LearningReport } from '../../entities/learning-report.entity';
import { KnowledgeMastery } from '../../entities/knowledge-mastery.entity';
import { WeakPoint } from '../../entities/weak-point.entity';
import { AnswerRecord } from '../../entities/answer-record.entity';
import { ClassStatistics } from '../../entities/class-statistics.entity';
import { ExerciseSession } from '../../entities/exercise-session.entity';
import { ClassStudent } from '../../entities/class-student.entity';
import { User } from '../../entities/user.entity';
import { GenerateReportDto } from './dto/generate-report.dto';
import { QueryReportDto } from './dto/query-report.dto';
import {
  ReportType,
  UserRole,
  PaginationResult,
} from '../../common/types';
import type { RequestUser } from '../../common/types';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(LearningReport)
    private readonly reportRepository: Repository<LearningReport>,
    @InjectRepository(KnowledgeMastery)
    private readonly masteryRepository: Repository<KnowledgeMastery>,
    @InjectRepository(WeakPoint)
    private readonly weakPointRepository: Repository<WeakPoint>,
    @InjectRepository(AnswerRecord)
    private readonly answerRecordRepository: Repository<AnswerRecord>,
    @InjectRepository(ClassStatistics)
    private readonly classStatisticsRepository: Repository<ClassStatistics>,
    @InjectRepository(ExerciseSession)
    private readonly exerciseSessionRepository: Repository<ExerciseSession>,
    @InjectRepository(ClassStudent)
    private readonly classStudentRepository: Repository<ClassStudent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getReportList(
    queryDto: QueryReportDto,
    currentUser: RequestUser,
  ): Promise<PaginationResult<LearningReport>> {
    const { page = 1, pageSize = 20, type, studentId, classId, subjectId, startTime, endTime } = queryDto;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.student', 'student')
      .leftJoinAndSelect('report.class', 'class')
      .leftJoinAndSelect('report.subject', 'subject')
      .leftJoinAndSelect('report.creator', 'creator');

    this.applyPermissionFilter(queryBuilder, currentUser);

    if (type) {
      queryBuilder.andWhere('report.type = :type', { type });
    }

    if (studentId) {
      queryBuilder.andWhere('report.studentId = :studentId', { studentId });
    }

    if (classId) {
      queryBuilder.andWhere('report.classId = :classId', { classId });
    }

    if (subjectId) {
      queryBuilder.andWhere('report.subjectId = :subjectId', { subjectId });
    }

    if (startTime) {
      queryBuilder.andWhere('report.createdAt >= :startTime', {
        startTime: new Date(startTime),
      });
    }

    if (endTime) {
      queryBuilder.andWhere('report.createdAt <= :endTime', {
        endTime: new Date(endTime),
      });
    }

    const [list, total] = await queryBuilder
      .orderBy('report.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async getReportDetail(id: number, currentUser: RequestUser): Promise<LearningReport> {
    const report = await this.reportRepository.findOne({
      where: { id, status: 1 },
      relations: {
        student: true,
        class: true,
        subject: true,
        creator: true,
      } as any,
    });

    if (!report) {
      throw new NotFoundException('报告不存在');
    }

    await this.checkReportPermission(report, currentUser);

    report.viewCount += 1;
    await this.reportRepository.save(report);

    return report;
  }

  async generateReport(
    generateDto: GenerateReportDto,
    currentUser: RequestUser,
  ): Promise<LearningReport> {
    const { type, studentId, classId, subjectId, periodStart, periodEnd, title, comparisonClassIds } = generateDto;

    await this.checkGeneratePermission(generateDto, currentUser);

    let content: any;
    let overallScore: number;
    let reportTitle = title;

    switch (type) {
      case ReportType.STUDENT_PERSONAL:
        if (!studentId) {
          throw new BadRequestException('学生个人报告需要指定 studentId');
        }
        const personalResult = await this.generateStudentPersonalReport(studentId, subjectId);
        content = personalResult.content;
        overallScore = personalResult.overallScore;
        reportTitle = title || `学生个人诊断报告 - ${new Date().toLocaleDateString()}`;
        break;

      case ReportType.STUDENT_PERIOD:
        if (!studentId || !periodStart || !periodEnd) {
          throw new BadRequestException('阶段性报告需要指定 studentId、periodStart 和 periodEnd');
        }
        const periodResult = await this.generateStudentPeriodReport(
          studentId,
          subjectId,
          periodStart,
          periodEnd,
        );
        content = periodResult.content;
        overallScore = periodResult.overallScore;
        reportTitle = title || `阶段性学习报告 - ${periodStart} 至 ${periodEnd}`;
        break;

      case ReportType.CLASS_OVERALL:
        if (!classId) {
          throw new BadRequestException('班级整体报告需要指定 classId');
        }
        const classResult = await this.generateClassOverallReport(classId, subjectId);
        content = classResult.content;
        overallScore = classResult.overallScore;
        reportTitle = title || `班级整体学情报告`;
        break;

      case ReportType.CLASS_COMPARISON:
        if (!comparisonClassIds || comparisonClassIds.length < 2) {
          throw new BadRequestException('班级对比报告需要至少指定2个班级');
        }
        const comparisonResult = await this.generateClassComparisonReport(
          comparisonClassIds,
          subjectId,
        );
        content = comparisonResult.content;
        overallScore = comparisonResult.overallScore;
        reportTitle = title || `班级对比报告`;
        break;

      case ReportType.DIAGNOSIS:
        throw new BadRequestException('诊断测试报告请通过专用接口生成');

      default:
        throw new BadRequestException('不支持的报告类型');
    }

    const report = new LearningReport();
    report.type = type;
    report.studentId = studentId;
    report.classId = classId;
    report.subjectId = subjectId;
    report.periodStart = periodStart ? new Date(periodStart) : undefined;
    report.periodEnd = periodEnd ? new Date(periodEnd) : undefined;
    report.title = reportTitle;
    report.content = content;
    report.overallScore = overallScore;
    report.comparisonClassIds = comparisonClassIds || undefined;
    report.creatorId = currentUser.id;
    report.isAutoGenerated = 0;
    report.status = 1;

    return this.reportRepository.save(report);
  }

  async generateDiagnosisReport(
    exerciseSessionId: number,
    currentUser: RequestUser,
  ): Promise<LearningReport> {
    const session = await this.exerciseSessionRepository.findOne({
      where: { id: exerciseSessionId },
      relations: {
        exercise: true,
        student: true,
      } as any,
    });

    if (!session) {
      throw new NotFoundException('练习会话不存在');
    }

    if (session.studentId !== currentUser.id && currentUser.role !== UserRole.ADMIN) {
      if (currentUser.role === UserRole.TEACHER && session.classId) {
        const isClassTeacher = await this.checkIsClassTeacher(
          session.classId,
          currentUser.id,
        );
        if (!isClassTeacher) {
          throw new ForbiddenException('无权生成该学生的诊断报告');
        }
      } else {
        throw new ForbiddenException('无权生成该学生的诊断报告');
      }
    }

    const answerRecords = await this.answerRecordRepository.find({
      where: { exerciseId: session.exerciseId, studentId: session.studentId },
      relations: {
        question: true,
      } as any,
    });

    const masteries = await this.masteryRepository.find({
      where: { studentId: session.studentId, subjectId: session.exercise.subjectId },
      relations: {
        knowledgePoint: true,
      } as any,
    });

    const weakPoints = await this.weakPointRepository.find({
      where: { studentId: session.studentId, subjectId: session.exercise.subjectId, isResolved: 0 },
      relations: {
        knowledgePoint: true,
      } as any,
    });

    const content = this.buildDiagnosisContent(session, answerRecords, masteries, weakPoints);
    const overallScore = this.calculateOverallScore(masteries);

    const report = new LearningReport();
    report.type = ReportType.DIAGNOSIS;
    report.studentId = session.studentId;
    report.classId = session.classId;
    report.subjectId = session.exercise.subjectId;
    report.title = `诊断测试报告 - ${session.exercise.name}`;
    report.content = content;
    report.overallScore = overallScore;
    report.creatorId = currentUser.id;
    report.isAutoGenerated = 1;
    report.status = 1;

    return this.reportRepository.save(report);
  }

  async deleteReport(id: number, currentUser: RequestUser): Promise<void> {
    const report = await this.reportRepository.findOne({
      where: { id, status: 1 },
    });

    if (!report) {
      throw new NotFoundException('报告不存在');
    }

    if (currentUser.role !== UserRole.ADMIN && report.creatorId !== currentUser.id) {
      throw new ForbiddenException('无权删除该报告');
    }

    report.status = 0;
    await this.reportRepository.save(report);
  }

  async shareReport(id: number, currentUser: RequestUser): Promise<{ shareUrl: string; shareToken: string }> {
    const report = await this.reportRepository.findOne({
      where: { id, status: 1 },
    });

    if (!report) {
      throw new NotFoundException('报告不存在');
    }

    await this.checkReportPermission(report, currentUser);

    const shareToken = uuidv4().replace(/-/g, '');
    report.shareToken = shareToken;
    await this.reportRepository.save(report);

    const shareUrl = `/api/reports/share/${shareToken}`;
    return { shareUrl, shareToken };
  }

  async getReportByShareToken(token: string): Promise<LearningReport> {
    const report = await this.reportRepository.findOne({
      where: { shareToken: token, status: 1 },
      relations: {
        student: true,
        class: true,
        subject: true,
        creator: true,
      } as any,
    });

    if (!report) {
      throw new NotFoundException('分享链接无效或已过期');
    }

    report.viewCount += 1;
    await this.reportRepository.save(report);

    return report;
  }

  private async generateStudentPersonalReport(studentId: number, subjectId: number) {
    const masteries = await this.masteryRepository.find({
      where: { studentId, subjectId },
      relations: {
        knowledgePoint: true,
      } as any,
    });

    const weakPoints = await this.weakPointRepository.find({
      where: { studentId, subjectId, isResolved: 0 },
      relations: {
        knowledgePoint: true,
      } as any,
    });

    const answerRecords = await this.answerRecordRepository.find({
      where: { studentId, subjectId },
      take: 100,
      order: { submitTime: 'DESC' },
    });

    const overallScore = this.calculateOverallScore(masteries);

    const content = {
      overview: {
        totalKnowledgePoints: masteries.length,
        masteredCount: masteries.filter((m) => m.masteryLevel >= 0.7).length,
        weakPointCount: weakPoints.length,
        totalQuestionsAnswered: answerRecords.length,
        correctRate: answerRecords.length > 0
          ? (answerRecords.filter((a) => a.isCorrect === 1).length / answerRecords.length * 100).toFixed(2)
          : '0.00',
      },
      masteryGraph: masteries.map((m) => ({
        knowledgePointId: m.knowledgePointId,
        knowledgePointName: m.knowledgePoint?.name,
        masteryLevel: m.masteryLevel,
        masteryTrend: m.masteryTrend,
        confidence: m.confidence,
      })),
      weakPointAnalysis: weakPoints.map((wp) => ({
        knowledgePointId: wp.knowledgePointId,
        knowledgePointName: wp.knowledgePoint?.name,
        weaknessScore: wp.weaknessScore,
        weaknessLevel: wp.weaknessLevel,
        reason: wp.reason,
        recommendedPracticeCount: wp.recommendedPracticeCount,
      })),
      learningSuggestions: this.generateLearningSuggestions(masteries, weakPoints),
    };

    return { content, overallScore };
  }

  private async generateStudentPeriodReport(
    studentId: number,
    subjectId: number,
    periodStart: string,
    periodEnd: string,
  ) {
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    const answerRecords = await this.answerRecordRepository.find({
      where: {
        studentId,
        subjectId,
        submitTime: Between(startDate, endDate),
      },
    });

    const masteries = await this.masteryRepository.find({
      where: { studentId, subjectId },
      relations: {
        knowledgePoint: true,
      } as any,
    });

    const weakPoints = await this.weakPointRepository.find({
      where: { studentId, subjectId, isResolved: 0 },
      relations: {
        knowledgePoint: true,
      } as any,
    });

    const overallScore = this.calculateOverallScore(masteries);

    const content = {
      periodStats: {
        periodStart,
        periodEnd,
        totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
        totalQuestions: answerRecords.length,
        correctCount: answerRecords.filter((a) => a.isCorrect === 1).length,
        wrongCount: answerRecords.filter((a) => a.isCorrect === 0).length,
        correctRate: answerRecords.length > 0
          ? (answerRecords.filter((a) => a.isCorrect === 1).length / answerRecords.length * 100).toFixed(2)
          : '0.00',
        totalTimeSpent: answerRecords.reduce((sum, a) => sum + (a.timeSpent || 0), 0),
      },
      masteryTrend: this.buildMasteryTrend(masteries, startDate, endDate),
      improvements: this.findImprovements(masteries, weakPoints),
      needsImprovement: this.findNeedsImprovement(masteries, weakPoints),
    };

    return { content, overallScore };
  }

  private async generateClassOverallReport(classId: number, subjectId: number) {
    const classStudents = await this.classStudentRepository.find({
      where: { classId },
      relations: {
        student: true,
      } as any,
    });

    const studentIds = classStudents.map((cs) => cs.studentId);

    const classStats = await this.classStatisticsRepository.findOne({
      where: { classId, subjectId },
      order: { statDate: 'DESC' },
    });

    const allMasteries = await this.masteryRepository.find({
      where: { studentId: In(studentIds), subjectId },
      relations: {
        knowledgePoint: true,
      } as any,
    });

    const allWeakPoints = await this.weakPointRepository.find({
      where: { studentId: In(studentIds), subjectId, isResolved: 0 },
      relations: {
        knowledgePoint: true,
      } as any,
    });

    const overallScore = classStats?.avgMastery || this.calculateClassOverallScore(allMasteries);

    const content = {
      classInfo: {
        studentCount: classStudents.length,
        className: classStudents[0]?.class?.name,
      },
      masteryDistribution: this.buildMasteryDistribution(allMasteries),
      knowledgePointComparison: this.buildKnowledgePointComparison(allMasteries),
      weakPointsSummary: this.buildWeakPointsSummary(allWeakPoints),
      studentStratification: this.buildStudentStratification(allMasteries, classStudents),
    };

    return { content, overallScore };
  }

  private async generateClassComparisonReport(classIds: number[], subjectId: number) {
    const comparisonData: Array<{
      classId: number;
      className: string;
      studentCount: number;
      avgMastery: number;
      avgScore?: number;
      correctRate?: number;
      weakPointCount?: number;
      masteryDistribution: any;
    }> = [];

    for (const classId of classIds) {
      const classStats = await this.classStatisticsRepository.findOne({
        where: { classId, subjectId },
        order: { statDate: 'DESC' },
        relations: {
          class: true,
        } as any,
      });

      const classStudents = await this.classStudentRepository.find({
        where: { classId },
      });

      const studentIds = classStudents.map((cs) => cs.studentId);

      const allMasteries = await this.masteryRepository.find({
        where: { studentId: In(studentIds), subjectId },
      });

      comparisonData.push({
        classId,
        className: classStats?.class?.name || `班级${classId}`,
        studentCount: classStudents.length,
        avgMastery: classStats?.avgMastery || this.calculateClassOverallScore(allMasteries),
        avgScore: classStats?.avgScore,
        correctRate: classStats?.correctRate,
        weakPointCount: classStats?.weakPointCount,
        masteryDistribution: classStats?.masteryDistribution || this.buildMasteryDistribution(allMasteries),
      });
    }

    const overallScore = comparisonData.reduce((sum, d) => sum + (d.avgMastery || 0), 0) / comparisonData.length;

    const content = {
      comparisonData,
      chartData: this.buildComparisonChartData(comparisonData),
    };

    return { content, overallScore };
  }

  private buildDiagnosisContent(
    session: ExerciseSession,
    answerRecords: AnswerRecord[],
    masteries: KnowledgeMastery[],
    weakPoints: WeakPoint[],
  ) {
    const questionAnalysis = answerRecords.map((record) => ({
      questionId: record.questionId,
      questionContent: record.question?.content,
      studentAnswer: record.studentAnswer,
      correctAnswer: record.question?.answer,
      isCorrect: record.isCorrect,
      score: record.score,
      timeSpent: record.timeSpent,
      knowledgePoints: record.question?.questionKnowledges?.map((qk) => qk.knowledgePointId) || [],
    }));

    const masteryAssessment = masteries.map((m) => ({
      knowledgePointId: m.knowledgePointId,
      knowledgePointName: m.knowledgePoint?.name,
      masteryLevel: m.masteryLevel,
      questionCount: m.totalQuestions,
      correctCount: m.correctCount,
    }));

    return {
      sessionInfo: {
        exerciseName: session.exercise.name,
        startTime: session.startTime,
        submitTime: session.submitTime,
        timeSpent: session.timeSpent,
        totalScore: session.totalScore,
        score: session.score,
        correctCount: session.correctCount,
        wrongCount: session.wrongCount,
      },
      questionAnalysis,
      masteryAssessment,
      weakPoints: weakPoints.map((wp) => ({
        knowledgePointId: wp.knowledgePointId,
        knowledgePointName: wp.knowledgePoint?.name,
        weaknessScore: wp.weaknessScore,
        weaknessLevel: wp.weaknessLevel,
      })),
      suggestions: this.generateDiagnosisSuggestions(questionAnalysis, weakPoints),
    };
  }

  private calculateOverallScore(masteries: KnowledgeMastery[]): number {
    if (masteries.length === 0) return 0;
    const total = masteries.reduce((sum, m) => sum + m.masteryLevel * m.confidence, 0);
    const totalConfidence = masteries.reduce((sum, m) => sum + m.confidence, 0);
    return totalConfidence > 0 ? Number((total / totalConfidence * 100).toFixed(2)) : 0;
  }

  private calculateClassOverallScore(masteries: KnowledgeMastery[]): number {
    if (masteries.length === 0) return 0;
    const uniqueStudents = new Set(masteries.map((m) => m.studentId));
    let totalScore = 0;
    uniqueStudents.forEach((studentId) => {
      const studentMasteries = masteries.filter((m) => m.studentId === studentId);
      totalScore += this.calculateOverallScore(studentMasteries);
    });
    return Number((totalScore / uniqueStudents.size).toFixed(2));
  }

  private generateLearningSuggestions(masteries: KnowledgeMastery[], weakPoints: WeakPoint[]) {
    const suggestions: Array<{ type: string; priority: string; content: string }> = [];

    const lowMastery = masteries.filter((m) => m.masteryLevel < 0.6);
    if (lowMastery.length > 0) {
      suggestions.push({
        type: 'weak_points',
        priority: 'high',
        content: `建议重点复习以下知识点：${lowMastery.slice(0, 3).map((m) => m.knowledgePoint?.name).join('、')}`,
      });
    }

    const criticalWeak = weakPoints.filter((wp) => wp.weaknessLevel === 'critical');
    if (criticalWeak.length > 0) {
      suggestions.push({
        type: 'critical_weak',
        priority: 'critical',
        content: `发现${criticalWeak.length}个严重薄弱点，建议立即进行针对性练习`,
      });
    }

    const highMastery = masteries.filter((m) => m.masteryLevel >= 0.9);
    if (highMastery.length > 0) {
      suggestions.push({
        type: 'strength',
        priority: 'low',
        content: `以下知识点掌握良好：${highMastery.slice(0, 3).map((m) => m.knowledgePoint?.name).join('、')}，可继续挑战更高难度`,
      });
    }

    return suggestions;
  }

  private generateDiagnosisSuggestions(questionAnalysis: any[], weakPoints: WeakPoint[]) {
    const suggestions: Array<{ type: string; priority: string; content: string }> = [];
    const wrongQuestions = questionAnalysis.filter((q) => !q.isCorrect);

    if (wrongQuestions.length > 0) {
      suggestions.push({
        type: 'wrong_questions',
        priority: 'high',
        content: `本次测试共有${wrongQuestions.length}道错题，建议认真分析错误原因，重新练习错题`,
      });
    }

    if (weakPoints.length > 0) {
      suggestions.push({
        type: 'knowledge_gaps',
        priority: 'high',
        content: `发现${weakPoints.length}个知识薄弱点，建议进行系统性复习和针对性练习`,
      });
    }

    const knowledgePointErrors: Record<string, number> = {};
    wrongQuestions.forEach((q) => {
      q.knowledgePoints?.forEach((kpId: number) => {
        knowledgePointErrors[kpId.toString()] = (knowledgePointErrors[kpId.toString()] || 0) + 1;
      });
    });

    Object.entries(knowledgePointErrors).forEach(([kpId, count]) => {
      if (count >= 2) {
        suggestions.push({
          type: 'specific_knowledge',
          priority: 'medium',
          content: `知识点 ${kpId} 相关题目错误较多，建议重点复习`,
        });
      }
    });

    return suggestions;
  }

  private buildMasteryTrend(masteries: KnowledgeMastery[], startDate: Date, endDate: Date) {
    return masteries.map((m) => ({
      knowledgePointId: m.knowledgePointId,
      knowledgePointName: m.knowledgePoint?.name,
      startMastery: m.masteryLevel,
      endMastery: m.masteryLevel,
      trend: m.masteryTrend,
      improvement: 0,
    }));
  }

  private findImprovements(masteries: KnowledgeMastery[], weakPoints: WeakPoint[]) {
    return masteries
      .filter((m) => m.masteryTrend === 'improving')
      .slice(0, 5)
      .map((m) => ({
        knowledgePointId: m.knowledgePointId,
        knowledgePointName: m.knowledgePoint?.name,
        masteryLevel: m.masteryLevel,
        description: '掌握度持续提升',
      }));
  }

  private findNeedsImprovement(masteries: KnowledgeMastery[], weakPoints: WeakPoint[]) {
    const declining = masteries
      .filter((m) => m.masteryTrend === 'declining')
      .slice(0, 3)
      .map((m) => ({
        knowledgePointId: m.knowledgePointId,
        knowledgePointName: m.knowledgePoint?.name,
        masteryLevel: m.masteryLevel,
        reason: '掌握度呈下降趋势',
      }));

    const criticalWeak = weakPoints
      .filter((wp) => wp.weaknessLevel === 'critical')
      .slice(0, 2)
      .map((wp) => ({
        knowledgePointId: wp.knowledgePointId,
        knowledgePointName: wp.knowledgePoint?.name,
        masteryLevel: null,
        reason: '严重薄弱点',
      }));

    return [...declining, ...criticalWeak];
  }

  private buildMasteryDistribution(masteries: KnowledgeMastery[]) {
    const distribution = { excellent: 0, good: 0, medium: 0, poor: 0 };
    const studentMasteryMap = new Map<number, number>();

    masteries.forEach((m) => {
      const current = studentMasteryMap.get(m.studentId) || 0;
      studentMasteryMap.set(m.studentId, current + m.masteryLevel);
    });

    studentMasteryMap.forEach((total, studentId) => {
      const studentMasteries = masteries.filter((m) => m.studentId === studentId);
      const avg = total / studentMasteries.length;
      if (avg >= 0.9) distribution.excellent++;
      else if (avg >= 0.7) distribution.good++;
      else if (avg >= 0.6) distribution.medium++;
      else distribution.poor++;
    });

    const total = studentMasteryMap.size || 1;
    return {
      ...distribution,
      percentages: {
        excellent: Number((distribution.excellent / total * 100).toFixed(2)),
        good: Number((distribution.good / total * 100).toFixed(2)),
        medium: Number((distribution.medium / total * 100).toFixed(2)),
        poor: Number((distribution.poor / total * 100).toFixed(2)),
      },
    };
  }

  private buildKnowledgePointComparison(masteries: KnowledgeMastery[]) {
    const kpMap = new Map<number, { total: number; count: number; name: string }>();

    masteries.forEach((m) => {
      const existing = kpMap.get(m.knowledgePointId) || { total: 0, count: 0, name: m.knowledgePoint?.name };
      existing.total += m.masteryLevel;
      existing.count += 1;
      kpMap.set(m.knowledgePointId, existing);
    });

    return Array.from(kpMap.entries()).map(([kpId, data]) => ({
      knowledgePointId: kpId,
      knowledgePointName: data.name,
      avgMastery: Number((data.total / data.count).toFixed(4)),
      studentCount: data.count,
    })).sort((a, b) => a.avgMastery - b.avgMastery);
  }

  private buildWeakPointsSummary(weakPoints: WeakPoint[]) {
    const kpMap = new Map<number, { count: number; name: string; totalScore: number }>();

    weakPoints.forEach((wp) => {
      const existing = kpMap.get(wp.knowledgePointId) || { count: 0, name: wp.knowledgePoint?.name, totalScore: 0 };
      existing.count += 1;
      existing.totalScore += wp.weaknessScore;
      kpMap.set(wp.knowledgePointId, existing);
    });

    return Array.from(kpMap.entries())
      .map(([kpId, data]) => ({
        knowledgePointId: kpId,
        knowledgePointName: data.name,
        studentCount: data.count,
        avgWeaknessScore: Number((data.totalScore / data.count).toFixed(4)),
      }))
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 10);
  }

  private buildStudentStratification(masteries: KnowledgeMastery[], classStudents: ClassStudent[]) {
    const studentScores: Array<{
      studentId: number;
      studentName: string;
      avgMastery: number;
    }> = [];

    classStudents.forEach((cs) => {
      const studentMasteries = masteries.filter((m) => m.studentId === cs.studentId);
      const avgMastery = studentMasteries.length > 0
        ? studentMasteries.reduce((sum, m) => sum + m.masteryLevel, 0) / studentMasteries.length
        : 0;
      studentScores.push({
        studentId: cs.studentId,
        studentName: cs.student?.realName,
        avgMastery: Number(avgMastery.toFixed(4)),
      });
    });

    studentScores.sort((a, b) => b.avgMastery - a.avgMastery);

    return {
      topStudents: studentScores.slice(0, Math.ceil(studentScores.length * 0.2)),
      bottomStudents: studentScores.slice(Math.floor(studentScores.length * 0.8)),
      allStudents: studentScores,
    };
  }

  private buildComparisonChartData(comparisonData: any[]) {
    return {
      avgMastery: comparisonData.map((d) => ({
        className: d.className,
        value: d.avgMastery,
      })),
      correctRate: comparisonData.map((d) => ({
        className: d.className,
        value: d.correctRate,
      })),
      weakPointCount: comparisonData.map((d) => ({
        className: d.className,
        value: d.weakPointCount,
      })),
    };
  }

  private applyPermissionFilter(queryBuilder: any, currentUser: RequestUser) {
    if (currentUser.role === UserRole.ADMIN) {
      return;
    }

    if (currentUser.role === UserRole.STUDENT) {
      queryBuilder.andWhere('report.studentId = :studentId', { studentId: currentUser.id });
    }

    if (currentUser.role === UserRole.TEACHER) {
      queryBuilder.andWhere(
        '(report.creatorId = :teacherId OR report.classId IN (SELECT c.id FROM ClassEntity c WHERE c.teacherId = :teacherId))',
        { teacherId: currentUser.id },
      );
    }
  }

  private async checkReportPermission(report: LearningReport, currentUser: RequestUser) {
    if (currentUser.role === UserRole.ADMIN) {
      return true;
    }

    if (currentUser.role === UserRole.STUDENT && report.studentId === currentUser.id) {
      return true;
    }

    if (currentUser.role === UserRole.TEACHER) {
      if (report.creatorId === currentUser.id) {
        return true;
      }
      if (report.classId && await this.checkIsClassTeacher(report.classId, currentUser.id)) {
        return true;
      }
    }

    throw new ForbiddenException('无权查看该报告');
  }

  private async checkGeneratePermission(generateDto: GenerateReportDto, currentUser: RequestUser) {
    if (currentUser.role === UserRole.ADMIN) {
      return true;
    }

    if (currentUser.role === UserRole.STUDENT) {
      if (generateDto.studentId && generateDto.studentId !== currentUser.id) {
        throw new ForbiddenException('无权生成其他学生的报告');
      }
      if (generateDto.type === ReportType.CLASS_OVERALL || generateDto.type === ReportType.CLASS_COMPARISON) {
        throw new ForbiddenException('学生无权生成班级报告');
      }
    }

    if (currentUser.role === UserRole.TEACHER) {
      if (generateDto.classId && !await this.checkIsClassTeacher(generateDto.classId, currentUser.id)) {
        throw new ForbiddenException('无权生成其他班级的报告');
      }
      if (generateDto.comparisonClassIds) {
        for (const classId of generateDto.comparisonClassIds) {
          if (!await this.checkIsClassTeacher(classId, currentUser.id)) {
            throw new ForbiddenException('无权对比其他班级');
          }
        }
      }
    }

    return true;
  }

  private async checkIsClassTeacher(classId: number, teacherId: number): Promise<boolean> {
    const cls = await this.classStudentRepository.manager
      .getRepository('ClassEntity')
      .findOne({ where: { id: classId, teacherId } });
    return !!cls;
  }
}
