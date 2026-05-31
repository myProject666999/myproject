import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, IsNull } from 'typeorm';
import { ClassEntity } from '../../entities/class.entity';
import { ClassStudent } from '../../entities/class-student.entity';
import { ClassStatistics } from '../../entities/class-statistics.entity';
import { KnowledgeMastery } from '../../entities/knowledge-mastery.entity';
import { WeakPoint } from '../../entities/weak-point.entity';
import { KnowledgePoint } from '../../entities/knowledge-point.entity';
import { Subject } from '../../entities/subject.entity';
import { UserRole } from '../../common/types';
import type { RequestUser } from '../../common/types';
import { AuditService } from '../../common/services/audit.service';
import {
  ClassComparisonDto,
  ClassTrendComparisonDto,
} from './dto/class-comparison.dto';

interface MasteryDistribution {
  range0_40: number;
  range40_60: number;
  range60_80: number;
  range80_100: number;
}

interface StudentRanking {
  rank: number;
  rankRange: string;
  studentId: number;
  studentName: string;
  isCurrentUser: boolean;
}

interface WeakPointSummary {
  knowledgePointId: number;
  knowledgePointName: string;
  subjectId: number;
  subjectName: string;
  studentCount: number;
  avgWeaknessScore: number;
  criticalCount: number;
  highCount: number;
}

interface ClassSubjectStats {
  subjectId: number;
  subjectName: string;
  avgMastery: number;
  maxMastery: number;
  minMastery: number;
  masteryDistribution: MasteryDistribution;
  weakPointCount: number;
  studentCount: number;
}

interface ClassOverallStats {
  classId: number;
  className: string;
  studentCount: number;
  overallAvgMastery: number;
  subjectStats: ClassSubjectStats[];
  totalWeakPoints: number;
  lastUpdated: Date;
}

interface ClassComparisonResult {
  classId: number;
  className: string;
  studentCount: number;
  overallAvgMastery: number;
  subjectStats: ClassSubjectStats[];
  totalWeakPoints: number;
}

interface TrendDataPoint {
  date: string;
  classId: number;
  className: string;
  avgMastery: number;
  subjectId?: number;
  subjectName?: string;
}

@Injectable()
export class ClassStatisticsService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
    @InjectRepository(ClassStudent)
    private readonly classStudentRepository: Repository<ClassStudent>,
    @InjectRepository(ClassStatistics)
    private readonly statsRepository: Repository<ClassStatistics>,
    @InjectRepository(KnowledgeMastery)
    private readonly masteryRepository: Repository<KnowledgeMastery>,
    @InjectRepository(WeakPoint)
    private readonly weakPointRepository: Repository<WeakPoint>,
    @InjectRepository(KnowledgePoint)
    private readonly kpRepository: Repository<KnowledgePoint>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly auditService: AuditService,
  ) {}

  async getClassStatistics(
    classId: number,
    currentUser: RequestUser,
  ): Promise<ClassOverallStats> {
    const cls = await this.validateClassAndPermission(classId, currentUser);

    const activeStudents = await this.classStudentRepository.find({
      where: { classId, isActive: 1 },
      select: { studentId: true },
    });
    const studentIds = activeStudents.map((cs) => cs.studentId);

    const subjects = await this.subjectRepository.find({
      where: { status: 1 },
    });

    const subjectStats: ClassSubjectStats[] = [];
    let totalMasterySum = 0;
    let totalMasteryCount = 0;

    for (const subject of subjects) {
      const stats = await this.calculateSubjectStats(
        classId,
        subject.id,
        studentIds,
      );
      if (stats) {
        subjectStats.push(stats);
        totalMasterySum += stats.avgMastery;
        totalMasteryCount++;
      }
    }

    const totalWeakPoints = await this.weakPointRepository.count({
      where: {
        studentId: In(studentIds),
        isResolved: 0,
      },
    });

    const result: ClassOverallStats = {
      classId: cls.id,
      className: cls.name,
      studentCount: studentIds.length,
      overallAvgMastery:
        totalMasteryCount > 0
          ? Math.round((totalMasterySum / totalMasteryCount) * 100) / 100
          : 0,
      subjectStats,
      totalWeakPoints,
      lastUpdated: new Date(),
    };

    await this.auditService.log(
      currentUser,
      '查看班级学情统计',
      'class_statistics',
      classId,
      `查看班级 "${cls.name}" 学情统计`,
    );

    return result;
  }

  async getSubjectStatistics(
    classId: number,
    subjectId: number,
    currentUser: RequestUser,
  ): Promise<ClassSubjectStats & { knowledgePointStats: any[] }> {
    const cls = await this.validateClassAndPermission(classId, currentUser);

    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId, status: 1 },
    });
    if (!subject) {
      throw new NotFoundException(`学科 ID ${subjectId} 不存在`);
    }

    const activeStudents = await this.classStudentRepository.find({
      where: { classId, isActive: 1 },
      select: { studentId: true },
    });
    const studentIds = activeStudents.map((cs) => cs.studentId);

    const subjectStats = await this.calculateSubjectStats(
      classId,
      subjectId,
      studentIds,
    );

    if (!subjectStats) {
      throw new NotFoundException('该学科暂无统计数据');
    }

    const knowledgePoints = await this.kpRepository.find({
      where: { subjectId, status: 1 },
    });

    const knowledgePointStats: Array<{
      knowledgePointId: number;
      knowledgePointName: string;
      avgMastery: number;
      maxMastery: number;
      minMastery: number;
      studentCount: number;
    }> = [];
    for (const kp of knowledgePoints) {
      const kpMasteries = await this.masteryRepository.find({
        where: {
          studentId: In(studentIds),
          knowledgePointId: kp.id,
          subjectId,
        },
        select: { masteryLevel: true },
      });

      if (kpMasteries.length > 0) {
        const levels = kpMasteries.map((m) => m.masteryLevel);
        knowledgePointStats.push({
          knowledgePointId: kp.id,
          knowledgePointName: kp.name,
          avgMastery:
            Math.round((levels.reduce((a, b) => a + b, 0) / levels.length) * 100) / 100,
          maxMastery: Math.max(...levels),
          minMastery: Math.min(...levels),
          studentCount: levels.length,
        });
      }
    }

    await this.auditService.log(
      currentUser,
      '查看班级学科统计',
      'class_statistics',
      classId,
      `查看班级 "${cls.name}" ${subject.name} 学科详细统计`,
      { subjectId },
    );

    return {
      ...subjectStats,
      knowledgePointStats,
    };
  }

  async getStudentRanking(
    classId: number,
    subjectId: number,
    currentUser: RequestUser,
  ): Promise<StudentRanking[]> {
    const cls = await this.validateClassAndPermission(classId, currentUser);

    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId, status: 1 },
    });
    if (!subject) {
      throw new NotFoundException(`学科 ID ${subjectId} 不存在`);
    }

    const activeStudents = await this.classStudentRepository.find({
      where: { classId, isActive: 1 },
      relations: { student: true },
    });
    const studentIds = activeStudents.map((cs) => cs.studentId);

    const masteryData = await this.masteryRepository
      .createQueryBuilder('m')
      .select('m.studentId', 'studentId')
      .addSelect('AVG(m.masteryLevel)', 'avgMastery')
      .where('m.studentId IN (:...studentIds)', { studentIds })
      .andWhere('m.subjectId = :subjectId', { subjectId })
      .groupBy('m.studentId')
      .orderBy('avgMastery', 'DESC')
      .getRawMany();

    const rankings: StudentRanking[] = masteryData.map((item, index) => {
      const classStudent = activeStudents.find(
        (cs) => cs.studentId === item.studentId,
      );
      const rank = index + 1;
      const totalStudents = masteryData.length;
      let rankRange: string;

      if (rank <= Math.ceil(totalStudents * 0.1)) {
        rankRange = '前10%';
      } else if (rank <= Math.ceil(totalStudents * 0.25)) {
        rankRange = '前25%';
      } else if (rank <= Math.ceil(totalStudents * 0.5)) {
        rankRange = '前50%';
      } else if (rank <= Math.ceil(totalStudents * 0.75)) {
        rankRange = '后50%';
      } else {
        rankRange = '后25%';
      }

      const isCurrentUser = item.studentId === currentUser.id;

      return {
        rank,
        rankRange,
        studentId: item.studentId,
        studentName:
          isCurrentUser || currentUser.role !== UserRole.STUDENT
            ? classStudent?.student.realName || '学生'
            : '同学',
        isCurrentUser,
      };
    });

    await this.auditService.log(
      currentUser,
      '查看班级学生排名',
      'class_statistics',
      classId,
      `查看班级 "${cls.name}" ${subject.name} 学科排名（隐私保护模式）`,
      { subjectId },
    );

    return rankings;
  }

  async getMasteryDistribution(
    classId: number,
    subjectId: number,
    currentUser: RequestUser,
  ): Promise<MasteryDistribution & { subjectName: string; totalStudents: number }> {
    const cls = await this.validateClassAndPermission(classId, currentUser);

    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId, status: 1 },
    });
    if (!subject) {
      throw new NotFoundException(`学科 ID ${subjectId} 不存在`);
    }

    const activeStudents = await this.classStudentRepository.find({
      where: { classId, isActive: 1 },
      select: { studentId: true },
    });
    const studentIds = activeStudents.map((cs) => cs.studentId);

    const masteries = await this.masteryRepository.find({
      where: {
        studentId: In(studentIds),
        subjectId,
      },
      select: { masteryLevel: true },
    });

    const distribution: MasteryDistribution = {
      range0_40: 0,
      range40_60: 0,
      range60_80: 0,
      range80_100: 0,
    };

    for (const m of masteries) {
      if (m.masteryLevel < 40) {
        distribution.range0_40++;
      } else if (m.masteryLevel < 60) {
        distribution.range40_60++;
      } else if (m.masteryLevel < 80) {
        distribution.range60_80++;
      } else {
        distribution.range80_100++;
      }
    }

    await this.auditService.log(
      currentUser,
      '查看班级掌握度分布',
      'class_statistics',
      classId,
      `查看班级 "${cls.name}" ${subject.name} 掌握度分布`,
      { subjectId },
    );

    return {
      ...distribution,
      subjectName: subject.name,
      totalStudents: studentIds.length,
    };
  }

  async getWeakPoints(
    classId: number,
    currentUser: RequestUser,
  ): Promise<WeakPointSummary[]> {
    const cls = await this.validateClassAndPermission(classId, currentUser);

    const activeStudents = await this.classStudentRepository.find({
      where: { classId, isActive: 1 },
      select: { studentId: true },
    });
    const studentIds = activeStudents.map((cs) => cs.studentId);

    const weakPoints = await this.weakPointRepository.find({
      where: {
        studentId: In(studentIds),
        isResolved: 0,
      },
      relations: { knowledgePoint: true, subject: true },
    });

    const kpMap = new Map<number, WeakPointSummary>();

    for (const wp of weakPoints) {
      const kpId = wp.knowledgePointId;
      if (!kpMap.has(kpId)) {
        kpMap.set(kpId, {
          knowledgePointId: kpId,
          knowledgePointName: wp.knowledgePoint?.name || '未知知识点',
          subjectId: wp.subjectId,
          subjectName: wp.subject?.name || '未知学科',
          studentCount: 0,
          avgWeaknessScore: 0,
          criticalCount: 0,
          highCount: 0,
        });
      }

      const summary = kpMap.get(kpId)!;
      summary.studentCount++;
      summary.avgWeaknessScore += Number(wp.weaknessScore);

      if (wp.weaknessLevel === 'critical') {
        summary.criticalCount++;
      } else if (wp.weaknessLevel === 'high') {
        summary.highCount++;
      }
    }

    const result: WeakPointSummary[] = [];
    for (const summary of kpMap.values()) {
      summary.avgWeaknessScore =
        Math.round((summary.avgWeaknessScore / summary.studentCount) * 100) / 100;
      result.push(summary);
    }

    result.sort((a, b) => b.studentCount - a.studentCount || b.avgWeaknessScore - a.avgWeaknessScore);

    await this.auditService.log(
      currentUser,
      '查看班级薄弱知识点',
      'class_statistics',
      classId,
      `查看班级 "${cls.name}" 薄弱知识点汇总，共 ${result.length} 个`,
    );

    return result;
  }

  async refreshStatistics(
    classId: number,
    currentUser: RequestUser,
  ): Promise<{ success: boolean; message: string; updatedCount: number }> {
    const cls = await this.validateClassAndPermission(classId, currentUser);

    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.role !== UserRole.TEACHER
    ) {
      throw new ForbiddenException('只有管理员和教师可以刷新统计数据');
    }

    const activeStudents = await this.classStudentRepository.find({
      where: { classId, isActive: 1 },
      select: { studentId: true },
    });
    const studentIds = activeStudents.map((cs) => cs.studentId);

    const subjects = await this.subjectRepository.find({
      where: { status: 1 },
    });

    let updatedCount = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const subject of subjects) {
      const stats = await this.calculateSubjectStats(
        classId,
        subject.id,
        studentIds,
      );

      if (stats) {
        let existing = await this.statsRepository.findOne({
          where: {
            classId,
            subjectId: subject.id,
            knowledgePointId: IsNull(),
            statDate: today,
          },
        });

        if (!existing) {
          existing = this.statsRepository.create({
            classId,
            subjectId: subject.id,
            statDate: today,
          });
        }

        existing.avgMastery = stats.avgMastery;
        existing.maxMastery = stats.maxMastery;
        existing.minMastery = stats.minMastery;
        existing.masteryDistribution = stats.masteryDistribution;
        existing.studentCount = stats.studentCount;
        existing.weakPointCount = stats.weakPointCount;

        await this.statsRepository.save(existing);
        updatedCount++;

        const knowledgePoints = await this.kpRepository.find({
          where: { subjectId: subject.id, status: 1 },
        });

        for (const kp of knowledgePoints) {
          const kpMasteries = await this.masteryRepository.find({
            where: {
              studentId: In(studentIds),
              knowledgePointId: kp.id,
              subjectId: subject.id,
            },
            select: { masteryLevel: true },
          });

          if (kpMasteries.length > 0) {
            const levels = kpMasteries.map((m) => m.masteryLevel);
            const kpDist = this.calculateDistribution(levels);

            let kpStats = await this.statsRepository.findOne({
              where: {
                classId,
                subjectId: subject.id,
                knowledgePointId: kp.id,
                statDate: today,
              },
            });

            if (!kpStats) {
              kpStats = this.statsRepository.create({
                classId,
                subjectId: subject.id,
                knowledgePointId: kp.id,
                statDate: today,
              });
            }

            kpStats.avgMastery =
              Math.round((levels.reduce((a, b) => a + b, 0) / levels.length) * 100) / 100;
            kpStats.maxMastery = Math.max(...levels);
            kpStats.minMastery = Math.min(...levels);
            kpStats.masteryDistribution = kpDist;
            kpStats.studentCount = levels.length;

            await this.statsRepository.save(kpStats);
            updatedCount++;
          }
        }
      }
    }

    await this.auditService.log(
      currentUser,
      '刷新班级统计数据',
      'class_statistics',
      classId,
      `手动刷新班级 "${cls.name}" 统计数据，更新 ${updatedCount} 条记录`,
    );

    return {
      success: true,
      message: `成功刷新 ${updatedCount} 条统计记录`,
      updatedCount,
    };
  }

  async compareClasses(
    dto: ClassComparisonDto,
    currentUser: RequestUser,
  ): Promise<ClassComparisonResult[]> {
    const results: ClassComparisonResult[] = [];

    for (const classId of dto.classIds) {
      try {
        const cls = await this.validateClassAndPermission(classId, currentUser);

        const activeStudents = await this.classStudentRepository.find({
          where: { classId, isActive: 1 },
          select: { studentId: true },
        });
        const studentIds = activeStudents.map((cs) => cs.studentId);

        let subjects: Subject[];
        if (dto.subjectId) {
          const subject = await this.subjectRepository.findOne({
            where: { id: dto.subjectId, status: 1 },
          });
          if (!subject) {
            throw new NotFoundException(`学科 ID ${dto.subjectId} 不存在`);
          }
          subjects = [subject];
        } else {
          subjects = await this.subjectRepository.find({ where: { status: 1 } });
        }

        const subjectStats: ClassSubjectStats[] = [];
        let totalMasterySum = 0;
        let totalMasteryCount = 0;

        for (const subject of subjects) {
          const where: any = {
            studentId: In(studentIds),
            subjectId: subject.id,
          };
          if (dto.startDate) {
            where.createdAt = Between(
              new Date(dto.startDate),
              dto.endDate ? new Date(dto.endDate) : new Date(),
            );
          }

          const masteries = await this.masteryRepository.find({
            where,
            select: { masteryLevel: true },
          });

          if (masteries.length > 0) {
            const levels = masteries.map((m) => m.masteryLevel);
            const distribution = this.calculateDistribution(levels);

            const weakPointCount = await this.weakPointRepository.count({
              where: {
                studentId: In(studentIds),
                subjectId: subject.id,
                isResolved: 0,
              },
            });

            const stat: ClassSubjectStats = {
              subjectId: subject.id,
              subjectName: subject.name,
              avgMastery:
                Math.round((levels.reduce((a, b) => a + b, 0) / levels.length) * 100) / 100,
              maxMastery: Math.max(...levels),
              minMastery: Math.min(...levels),
              masteryDistribution: distribution,
              weakPointCount,
              studentCount: new Set(masteries.map((m) => m.studentId)).size,
            };

            subjectStats.push(stat);
            totalMasterySum += stat.avgMastery;
            totalMasteryCount++;
          }
        }

        const totalWeakPoints = await this.weakPointRepository.count({
          where: {
            studentId: In(studentIds),
            isResolved: 0,
          },
        });

        results.push({
          classId: cls.id,
          className: cls.name,
          studentCount: studentIds.length,
          overallAvgMastery:
            totalMasteryCount > 0
              ? Math.round((totalMasterySum / totalMasteryCount) * 100) / 100
              : 0,
          subjectStats,
          totalWeakPoints,
        });
      } catch {
        continue;
      }
    }

    await this.auditService.log(
      currentUser,
      '多班级对比分析',
      'class_statistics',
      undefined,
      `对比 ${results.length} 个班级的学情数据`,
      dto,
    );

    return results;
  }

  async getTrendComparison(
    dto: ClassTrendComparisonDto,
    currentUser: RequestUser,
  ): Promise<TrendDataPoint[]> {
    const days = dto.days || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const results: TrendDataPoint[] = [];

    for (const classId of dto.classIds) {
      try {
        const cls = await this.validateClassAndPermission(classId, currentUser);

        const activeStudents = await this.classStudentRepository.find({
          where: { classId, isActive: 1 },
          select: { studentId: true },
        });
        const studentIds = activeStudents.map((cs) => cs.studentId);

        const stats = await this.statsRepository
          .createQueryBuilder('s')
          .where('s.classId = :classId', { classId })
          .andWhere('s.statDate >= :startDate', { startDate })
          .andWhere('s.statDate <= :endDate', { endDate })
          .andWhere('s.knowledgePointId IS NULL')
          .andWhere(dto.subjectId ? 's.subjectId = :subjectId' : '1=1', {
            subjectId: dto.subjectId,
          })
          .orderBy('s.statDate', 'ASC')
          .getMany();

        for (const stat of stats) {
          const subject = await this.subjectRepository.findOne({
            where: { id: stat.subjectId },
          });

          results.push({
            date: stat.statDate.toISOString().split('T')[0],
            classId: cls.id,
            className: cls.name,
            avgMastery: stat.avgMastery || 0,
            subjectId: stat.subjectId,
            subjectName: subject?.name,
          });
        }
      } catch {
        continue;
      }
    }

    await this.auditService.log(
      currentUser,
      '班级学情趋势对比',
      'class_statistics',
      undefined,
      `对比 ${dto.classIds.length} 个班级近 ${days} 天的学情趋势`,
      dto,
    );

    return results;
  }

  private async calculateSubjectStats(
    classId: number,
    subjectId: number,
    studentIds: number[],
  ): Promise<ClassSubjectStats | null> {
    const subject = await this.subjectRepository.findOne({
      where: { id: subjectId },
    });
    if (!subject) return null;

    const masteries = await this.masteryRepository.find({
      where: {
        studentId: In(studentIds),
        subjectId,
      },
      select: { masteryLevel: true },
    });

    if (masteries.length === 0) return null;

    const levels = masteries.map((m) => m.masteryLevel);
    const distribution = this.calculateDistribution(levels);

    const weakPointCount = await this.weakPointRepository.count({
      where: {
        studentId: In(studentIds),
        subjectId,
        isResolved: 0,
      },
    });

    return {
      subjectId,
      subjectName: subject.name,
      avgMastery:
        Math.round((levels.reduce((a, b) => a + b, 0) / levels.length) * 100) / 100,
      maxMastery: Math.max(...levels),
      minMastery: Math.min(...levels),
      masteryDistribution: distribution,
      weakPointCount,
      studentCount: new Set(masteries.map((m) => m.studentId)).size,
    };
  }

  private calculateDistribution(levels: number[]): MasteryDistribution {
    const distribution: MasteryDistribution = {
      range0_40: 0,
      range40_60: 0,
      range60_80: 0,
      range80_100: 0,
    };

    for (const level of levels) {
      if (level < 40) {
        distribution.range0_40++;
      } else if (level < 60) {
        distribution.range40_60++;
      } else if (level < 80) {
        distribution.range60_80++;
      } else {
        distribution.range80_100++;
      }
    }

    return distribution;
  }

  private async validateClassAndPermission(
    classId: number,
    currentUser: RequestUser,
  ): Promise<ClassEntity> {
    const cls = await this.classRepository.findOne({
      where: { id: classId, status: 1 },
    });
    if (!cls) {
      throw new NotFoundException(`班级 ID ${classId} 不存在`);
    }

    if (currentUser.role === UserRole.ADMIN) {
      return cls;
    }

    if (currentUser.role === UserRole.TEACHER) {
      if (cls.teacherId !== currentUser.id) {
        throw new ForbiddenException('您无权查看此班级的统计数据');
      }
    } else if (currentUser.role === UserRole.STUDENT) {
      const isInClass = await this.classStudentRepository.findOne({
        where: { classId, studentId: currentUser.id, isActive: 1 },
      });
      if (!isInClass) {
        throw new ForbiddenException('您无权查看此班级的统计数据');
      }
    }

    return cls;
  }
}
