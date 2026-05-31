import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, FindOptionsWhere } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ExportRecord } from '../../entities/export-record.entity';
import { User } from '../../entities/user.entity';
import { KnowledgeMastery } from '../../entities/knowledge-mastery.entity';
import { WeakPoint } from '../../entities/weak-point.entity';
import { ClassEntity } from '../../entities/class.entity';
import { ClassStatistics } from '../../entities/class-statistics.entity';
import { ClassStudent } from '../../entities/class-student.entity';
import { AnswerRecord } from '../../entities/answer-record.entity';
import { MasteryHistory } from '../../entities/mastery-history.entity';
import { Question } from '../../entities/question.entity';
import {
  ExportType,
  ExportFormat,
  UserRole,
  RequestUser,
  PaginationResult,
} from '../../common/types';
import { CreateExportDto } from './dto/create-export.dto';
import { PdfService } from './pdf.service';
import { ExcelService } from './excel.service';
import { AuditService } from '../../common/services/audit.service';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);
  private readonly EXPIRE_DAYS = 7;

  constructor(
    @InjectRepository(ExportRecord)
    private exportRecordRepository: Repository<ExportRecord>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(KnowledgeMastery)
    private knowledgeMasteryRepository: Repository<KnowledgeMastery>,
    @InjectRepository(WeakPoint)
    private weakPointRepository: Repository<WeakPoint>,
    @InjectRepository(ClassEntity)
    private classRepository: Repository<ClassEntity>,
    @InjectRepository(ClassStatistics)
    private classStatisticsRepository: Repository<ClassStatistics>,
    @InjectRepository(ClassStudent)
    private classStudentRepository: Repository<ClassStudent>,
    @InjectRepository(AnswerRecord)
    private answerRecordRepository: Repository<AnswerRecord>,
    @InjectRepository(MasteryHistory)
    private masteryHistoryRepository: Repository<MasteryHistory>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    private configService: ConfigService,
    private pdfService: PdfService,
    private excelService: ExcelService,
    private auditService: AuditService,
  ) {
    this.ensureExportDir();
  }

  private ensureExportDir(): void {
    const exportDir = this.configService.get<string>('exportDir') || './exports';
    const absolutePath = path.resolve(exportDir);
    if (!fs.existsSync(absolutePath)) {
      fs.mkdirSync(absolutePath, { recursive: true });
      this.logger.log(`创建导出目录: ${absolutePath}`);
    }
  }

  private getExportDir(): string {
    const exportDir = this.configService.get<string>('exportDir') || './exports';
    return path.resolve(exportDir);
  }

  async createExport(
    dto: CreateExportDto,
    user: RequestUser,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ExportRecord> {
    if (user.role === UserRole.STUDENT && !dto.studentId) {
      dto.studentId = Number(user.id);
    }

    await this.checkPermission(dto, user);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.EXPIRE_DAYS);

    const exportRecord = this.exportRecordRepository.create({
      requesterId: user.id,
      type: dto.type,
      format: dto.format,
      parameters: {
        studentId: dto.studentId,
        classId: dto.classId,
        subjectId: dto.subjectId,
        ...dto.parameters,
      },
      status: 'pending',
      expiresAt,
      downloadCount: 0,
    });

    const savedRecord = await this.exportRecordRepository.save(exportRecord);

    await this.auditService.log(
      user,
      'create_export',
      'export_record',
      savedRecord.id,
      `申请导出: ${dto.type} - ${dto.format}`,
      dto,
      { exportId: savedRecord.id },
      ipAddress,
      userAgent,
    );

    setImmediate(() => {
      this.processExport(savedRecord.id).catch((error) => {
        this.logger.error(`异步处理导出失败 [${savedRecord.id}]:`, error);
      });
    });

    return savedRecord;
  }

  private async checkPermission(
    dto: CreateExportDto,
    user: RequestUser,
  ): Promise<void> {
    if (user.role === UserRole.ADMIN) {
      return;
    }

    switch (dto.type) {
      case ExportType.STUDENT_REPORT:
        if (user.role === UserRole.STUDENT) {
          if (dto.studentId && Number(dto.studentId) !== Number(user.id)) {
            throw new ForbiddenException('学生只能导出自己的报告');
          }
        } else if (user.role === UserRole.TEACHER) {
          if (dto.studentId) {
            const classStudent = await this.classStudentRepository.findOne({
              where: {
                studentId: dto.studentId,
                isActive: 1,
              },
              relations: { class: true },
            });
            if (!classStudent || classStudent.class.teacherId !== user.id) {
              throw new ForbiddenException('只能导出所教班级学生的数据');
            }
          }
        }
        break;

      case ExportType.CLASS_REPORT:
        if (user.role === UserRole.TEACHER) {
          if (!dto.classId) {
            throw new BadRequestException('请指定班级ID');
          }
          const classEntity = await this.classRepository.findOne({
            where: { id: dto.classId },
          });
          if (!classEntity || classEntity.teacherId !== user.id) {
            throw new ForbiddenException('只能导出所教班级的报告');
          }
        } else if (user.role === UserRole.STUDENT) {
          throw new ForbiddenException('学生无权导出班级报告');
        }
        break;

      case ExportType.ANSWER_RECORDS:
      case ExportType.MASTERY_DATA:
        if (user.role === UserRole.STUDENT) {
          if (dto.studentId && Number(dto.studentId) !== Number(user.id)) {
            throw new ForbiddenException('学生只能导出自己的数据');
          }
        }
        break;

      case ExportType.QUESTION_BANK:
        if (user.role === UserRole.STUDENT) {
          throw new ForbiddenException('学生无权导出题题库');
        }
        break;
    }
  }

  async findAll(
    user: RequestUser,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<PaginationResult<ExportRecord>> {
    const where: FindOptionsWhere<ExportRecord> = {};
    if (user.role !== UserRole.ADMIN) {
      where.requesterId = user.id;
    }

    const [list, total] = await this.exportRecordRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: { requester: true },
    });

    return { list, total, page, pageSize };
  }

  async findOne(id: number, user: RequestUser): Promise<ExportRecord> {
    const record = await this.exportRecordRepository.findOne({
      where: { id },
      relations: { requester: true },
    });

    if (!record) {
      throw new NotFoundException('导出记录不存在');
    }

    if (user.role !== UserRole.ADMIN && record.requesterId !== user.id) {
      throw new ForbiddenException('无权访问该导出记录');
    }

    return record;
  }

  async getDownloadPath(
    id: number,
    user: RequestUser,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ path: string; filename: string; record: ExportRecord }> {
    const record = await this.findOne(id, user);

    if (record.status !== 'completed') {
      throw new BadRequestException('导出任务尚未完成');
    }

    if (!record.filePath || !fs.existsSync(record.filePath)) {
      throw new NotFoundException('导出文件不存在');
    }

    if (record.expiresAt && new Date() > record.expiresAt) {
      throw new BadRequestException('导出文件已过期');
    }

    record.downloadCount = (record.downloadCount || 0) + 1;
    await this.exportRecordRepository.save(record);

    await this.auditService.log(
      user,
      'download_export',
      'export_record',
      record.id,
      `下载导出文件: ${record.type} - ${record.format}`,
      null,
      { fileName: record.fileName },
      ipAddress,
      userAgent,
    );

    const originalName = this.getOriginalFilename(record);

    return {
      path: record.filePath,
      filename: originalName,
      record,
    };
  }

  private getOriginalFilename(record: ExportRecord): string {
    const typeMap: Record<string, string> = {
      [ExportType.STUDENT_REPORT]: '学生学情报告',
      [ExportType.CLASS_REPORT]: '班级学情报告',
      [ExportType.ANSWER_RECORDS]: '答题记录',
      [ExportType.MASTERY_DATA]: '掌握度数据',
      [ExportType.QUESTION_BANK]: '题库',
    };

    const formatMap: Record<string, string> = {
      [ExportFormat.PDF]: 'pdf',
      [ExportFormat.EXCEL]: 'xlsx',
      [ExportFormat.CSV]: 'csv',
      [ExportFormat.JSON]: 'json',
    };

    const typeName = typeMap[record.type] || '导出';
    const formatExt = formatMap[record.format] || 'dat';
    const dateStr = record.createdAt
      ? new Date(record.createdAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

    return `${typeName}_${dateStr}.${formatExt}`;
  }

  async delete(
    id: number,
    user: RequestUser,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const record = await this.findOne(id, user);

    if (record.filePath && fs.existsSync(record.filePath)) {
      try {
        fs.unlinkSync(record.filePath);
      } catch (error) {
        this.logger.warn(`删除导出文件失败: ${record.filePath}`, error);
      }
    }

    await this.exportRecordRepository.softDelete(record.id);

    await this.auditService.log(
      user,
      'delete_export',
      'export_record',
      record.id,
      `删除导出记录: ${record.type} - ${record.format}`,
      null,
      null,
      ipAddress,
      userAgent,
    );
  }

  async processExport(exportId: number): Promise<void> {
    this.logger.log(`开始处理导出任务 [${exportId}]`);

    const record = await this.exportRecordRepository.findOne({
      where: { id: exportId },
    });

    if (!record) {
      this.logger.error(`导出记录不存在 [${exportId}]`);
      return;
    }

    try {
      record.status = 'processing';
      await this.exportRecordRepository.save(record);

      const data = await this.collectExportData(record);
      const filePath = await this.generateExportFile(record, data);
      const stats = fs.statSync(filePath);

      record.status = 'completed';
      record.fileName = path.basename(filePath);
      record.filePath = filePath;
      record.fileSize = stats.size;
      record.completedAt = new Date();

      await this.exportRecordRepository.save(record);
      this.logger.log(`导出任务完成 [${exportId}]: ${filePath}`);
    } catch (error) {
      this.logger.error(`导出任务失败 [${exportId}]:`, error);
      record.status = 'failed';
      record.errorMessage = error instanceof Error ? error.message : String(error);
      await this.exportRecordRepository.save(record);
    }
  }

  private async collectExportData(record: ExportRecord): Promise<any> {
    const params = record.parameters || {};
    const subjectId = params.subjectId;

    switch (record.type) {
      case ExportType.STUDENT_REPORT:
        return this.collectStudentReportData(params.studentId, subjectId);

      case ExportType.CLASS_REPORT:
        return this.collectClassReportData(params.classId, subjectId);

      case ExportType.ANSWER_RECORDS:
        return this.collectAnswerRecordsData(params, subjectId);

      case ExportType.MASTERY_DATA:
        return this.collectMasteryData(params, subjectId);

      case ExportType.QUESTION_BANK:
        return this.collectQuestionBankData(params, subjectId);

      default:
        throw new Error(`不支持的导出类型: ${record.type}`);
    }
  }

  private async collectStudentReportData(
    studentId: number,
    subjectId?: number,
  ): Promise<any> {
    const student = await this.userRepository.findOne({
      where: { id: studentId },
    });
    if (!student) {
      throw new NotFoundException('学生不存在');
    }

    const masteryWhere: any = { studentId };
    if (subjectId) masteryWhere.subjectId = subjectId;

    const masteryData = await this.knowledgeMasteryRepository.find({
      where: masteryWhere,
      relations: { knowledgePoint: true, subject: true },
      order: { masteryLevel: 'DESC' },
    });

    const weakWhere: any = { studentId, isResolved: 0 };
    if (subjectId) weakWhere.subjectId = subjectId;

    const weakPoints = await this.weakPointRepository.find({
      where: weakWhere,
      relations: { knowledgePoint: true },
      order: { weaknessScore: 'DESC' },
    });

    return { student, masteryData, weakPoints, subjectId };
  }

  private async collectClassReportData(
    classId: number,
    subjectId?: number,
  ): Promise<any> {
    const classInfo = await this.classRepository.findOne({
      where: { id: classId },
      relations: { teacher: true },
    });
    if (!classInfo) {
      throw new NotFoundException('班级不存在');
    }

    const statWhere: any = { classId };
    if (subjectId) statWhere.subjectId = subjectId;

    const statistics = await this.classStatisticsRepository.find({
      where: statWhere,
      order: { statDate: 'DESC' },
      take: 10,
    });

    const classStudents = await this.classStudentRepository.find({
      where: { classId, isActive: 1 },
      relations: { student: true },
    });

    const studentIds = classStudents.map((cs) => cs.studentId);
    const studentList = classStudents.map((cs) => cs.student).filter(Boolean);

    const masteryWhere: any = { studentId: In(studentIds) };
    if (subjectId) masteryWhere.subjectId = subjectId;

    const masteryData = await this.knowledgeMasteryRepository.find({
      where: masteryWhere,
      relations: { knowledgePoint: true },
    });

    return { classInfo, statistics, masteryData, studentList };
  }

  private async collectAnswerRecordsData(
    params: any,
    subjectId?: number,
  ): Promise<any> {
    const where: any = {};
    if (params.studentId) where.studentId = params.studentId;
    if (subjectId) where.subjectId = subjectId;
    if (params.classId) {
      const classStudents = await this.classStudentRepository.find({
        where: { classId: params.classId, isActive: 1 },
      });
      where.studentId = In(classStudents.map((cs) => cs.studentId));
    }
    if (params.startDate && params.endDate) {
      where.submitTime = Between(
        new Date(params.startDate),
        new Date(params.endDate),
      );
    }

    const records = await this.answerRecordRepository.find({
      where,
      relations: { student: true, question: true, subject: true },
      order: { submitTime: 'DESC' },
      take: 10000,
    });

    return { records };
  }

  private async collectMasteryData(
    params: any,
    subjectId?: number,
  ): Promise<any> {
    const where: any = {};
    if (params.studentId) where.studentId = params.studentId;
    if (subjectId) where.subjectId = subjectId;
    if (params.classId) {
      const classStudents = await this.classStudentRepository.find({
        where: { classId: params.classId, isActive: 1 },
      });
      where.studentId = In(classStudents.map((cs) => cs.studentId));
    }

    const masteryData = await this.knowledgeMasteryRepository.find({
      where,
      relations: { student: true, knowledgePoint: true, subject: true },
      order: { masteryLevel: 'DESC' },
    });

    const historyWhere: any = {};
    if (params.studentId) historyWhere.studentId = params.studentId;
    if (subjectId) historyWhere.subjectId = subjectId;

    const historyData = await this.masteryHistoryRepository.find({
      where: historyWhere,
      relations: { student: true, knowledgePoint: true },
      order: { recordDate: 'DESC' },
      take: 1000,
    });

    return { masteryData, historyData };
  }

  private async collectQuestionBankData(
    params: any,
    subjectId?: number,
  ): Promise<any> {
    const where: any = { status: 1 };
    if (subjectId) where.subjectId = subjectId;
    if (params.type) where.type = params.type;
    if (params.difficulty) where.difficulty = params.difficulty;
    if (params.knowledgePointId) {
      const questions = await this.questionRepository
        .createQueryBuilder('q')
        .innerJoin('q.questionKnowledges', 'qk', 'qk.knowledgePointId = :kpId', {
          kpId: params.knowledgePointId,
        })
        .where('q.status = 1')
        .andWhere(subjectId ? 'q.subjectId = :subjectId' : '1=1', { subjectId })
        .getMany();
      return { questions };
    }

    const questions = await this.questionRepository.find({
      where,
      relations: { subject: true, questionKnowledges: { knowledgePoint: true } },
      order: { createdAt: 'DESC' },
    });

    return { questions };
  }

  private async generateExportFile(
    record: ExportRecord,
    data: any,
  ): Promise<string> {
    const exportDir = this.getExportDir();
    const fileId = uuidv4();
    const extMap: Record<string, string> = {
      [ExportFormat.PDF]: 'pdf',
      [ExportFormat.EXCEL]: 'xlsx',
      [ExportFormat.CSV]: 'csv',
      [ExportFormat.JSON]: 'json',
    };

    const ext = extMap[record.format] || 'dat';
    const fileName = `${fileId}.${ext}`;
    const filePath = path.join(exportDir, fileName);

    if (filePath.indexOf(exportDir) !== 0) {
      throw new Error('文件路径不安全');
    }

    switch (record.format) {
      case ExportFormat.PDF:
        await this.pdfService.generatePdf(record.type, filePath, data);
        break;
      case ExportFormat.EXCEL:
        await this.excelService.generateExcel(record.type, filePath, data);
        break;
      case ExportFormat.CSV:
        await this.generateCsv(record.type, filePath, data);
        break;
      case ExportFormat.JSON:
        await this.generateJson(filePath, data);
        break;
      default:
        throw new Error(`不支持的导出格式: ${record.format}`);
    }

    return filePath;
  }

  private async generateCsv(
    exportType: ExportType,
    filePath: string,
    data: any,
  ): Promise<void> {
    let headers: string[] = [];
    let rows: any[][] = [];

    switch (exportType) {
      case ExportType.ANSWER_RECORDS:
        headers = [
          '记录ID',
          '学生姓名',
          '题目ID',
          '题目类型',
          '学科',
          '学生答案',
          '正确答案',
          '是否正确',
          '得分',
          '用时(秒)',
          '提交时间',
        ];
        rows = data.records?.map((r: AnswerRecord) => [
          r.id,
          r.student?.realName || '',
          r.questionId,
          r.question?.type || '',
          r.subject?.name || '',
          (r.studentAnswer || '').replace(/,/g, '，'),
          (r.question?.answer || '').replace(/,/g, '，'),
          r.isCorrect ? '是' : '否',
          r.score?.toFixed(1) || '0',
          r.timeSpent || 0,
          r.submitTime
            ? new Date(r.submitTime).toLocaleString('zh-CN')
            : '',
        ]) || [];
        break;

      case ExportType.MASTERY_DATA:
        headers = [
          '学生姓名',
          '知识点',
          '学科',
          '掌握度(%)',
          '置信度(%)',
          '总答题数',
          '正确数',
          '错误数',
          '趋势',
        ];
        rows = data.masteryData?.map((m: KnowledgeMastery) => [
          m.student?.realName || '',
          m.knowledgePoint?.name || '',
          m.subject?.name || '',
          m.masteryLevel?.toFixed(1) || '0',
          m.confidence?.toFixed(1) || '0',
          m.totalQuestions || 0,
          m.correctCount || 0,
          m.wrongCount || 0,
          m.masteryTrend || '',
        ]) || [];
        break;

      case ExportType.QUESTION_BANK:
        headers = [
          '题目ID',
          '学科',
          '题目类型',
          '难度',
          '题目内容',
          '答案',
          '分数',
          '知识点',
          '状态',
        ];
        rows = data.questions?.map((q: Question) => [
          q.id,
          q.subject?.name || '',
          q.type,
          q.difficulty,
          (q.content || '').replace(/,/g, '，').replace(/\n/g, ' '),
          (q.answer || '').replace(/,/g, '，'),
          q.score?.toFixed(1) || '0',
          q.questionKnowledges
            ?.map((qk) => qk.knowledgePoint?.name)
            .filter(Boolean)
            .join(';') || '',
          q.status ? '启用' : '禁用',
        ]) || [];
        break;

      case ExportType.STUDENT_REPORT:
        headers = ['知识点', '掌握度(%)', '置信度(%)', '总答题数', '正确数'];
        rows = data.masteryData?.map((m: KnowledgeMastery) => [
          m.knowledgePoint?.name || '',
          m.masteryLevel?.toFixed(1) || '0',
          m.confidence?.toFixed(1) || '0',
          m.totalQuestions || 0,
          m.correctCount || 0,
        ]) || [];
        break;

      case ExportType.CLASS_REPORT:
        headers = ['知识点', '平均掌握度(%)', '掌握人数', '未掌握人数'];
        const masteryByKp = new Map<
          number,
          { total: number; count: number; name: string }
        >();
        data.masteryData?.forEach((m: KnowledgeMastery) => {
          const existing = masteryByKp.get(m.knowledgePointId) || {
            total: 0,
            count: 0,
            name: m.knowledgePoint?.name || '未知',
          };
          existing.total += m.masteryLevel;
          existing.count += 1;
          masteryByKp.set(m.knowledgePointId, existing);
        });
        for (const [, item] of masteryByKp) {
          const avg = item.total / item.count;
          rows.push([
            item.name,
            avg.toFixed(1),
            Math.floor(item.count * (avg / 100)),
            item.count - Math.floor(item.count * (avg / 100)),
          ]);
        }
        break;

      default:
        throw new Error(`不支持的CSV导出类型: ${exportType}`);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const BOM = '\uFEFF';
    fs.writeFileSync(filePath, BOM + csvContent, 'utf-8');
  }

  private async generateJson(filePath: string, data: any): Promise<void> {
    const jsonContent = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonContent, 'utf-8');
  }

  async cleanupExpiredFiles(): Promise<{ deleted: number; failed: number }> {
    this.logger.log('开始清理过期导出文件');

    const now = new Date();
    const expiredRecords = await this.exportRecordRepository
      .createQueryBuilder('er')
      .where('er.expiresAt < :now', { now })
      .andWhere('er.filePath IS NOT NULL')
      .getMany();

    let deleted = 0;
    let failed = 0;

    for (const record of expiredRecords) {
      try {
        if (record.filePath && fs.existsSync(record.filePath)) {
          fs.unlinkSync(record.filePath);
        }
        record.filePath = undefined;
        record.fileName = undefined;
        record.fileSize = undefined;
        record.status = 'expired';
        await this.exportRecordRepository.save(record);
        deleted++;
      } catch (error) {
        this.logger.error(`清理过期文件失败 [${record.id}]:`, error);
        failed++;
      }
    }

    this.logger.log(`清理过期导出文件完成: 删除${deleted}个, 失败${failed}个`);
    return { deleted, failed };
  }
}
