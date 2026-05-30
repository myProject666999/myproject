import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ExportType } from '../../common/types';
import { AnswerRecord } from '../../entities/answer-record.entity';
import { KnowledgeMastery } from '../../entities/knowledge-mastery.entity';
import { MasteryHistory } from '../../entities/mastery-history.entity';
import { Question } from '../../entities/question.entity';

@Injectable()
export class ExcelService {
  private readonly logger = new Logger(ExcelService.name);

  async generateAnswerRecords(
    filePath: string,
    records: AnswerRecord[],
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = '学习诊断系统';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('答题记录', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    worksheet.columns = [
      { header: '记录ID', key: 'id', width: 12 },
      { header: '学生姓名', key: 'studentName', width: 12 },
      { header: '题目ID', key: 'questionId', width: 12 },
      { header: '题目类型', key: 'questionType', width: 12 },
      { header: '学科', key: 'subject', width: 12 },
      { header: '学生答案', key: 'studentAnswer', width: 30 },
      { header: '正确答案', key: 'correctAnswer', width: 30 },
      { header: '是否正确', key: 'isCorrect', width: 10 },
      { header: '得分', key: 'score', width: 10 },
      { header: '用时(秒)', key: 'timeSpent', width: 12 },
      { header: '提交时间', key: 'submitTime', width: 22 },
      { header: '来源', key: 'source', width: 12 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    records.forEach((record) => {
      worksheet.addRow({
        id: record.id,
        studentName: record.student?.realName || '未知',
        questionId: record.questionId,
        questionType: record.question?.type || '未知',
        subject: record.subject?.name || '未知',
        studentAnswer: record.studentAnswer || '',
        correctAnswer: record.question?.answer || '',
        isCorrect: record.isCorrect ? '是' : '否',
        score: record.score?.toFixed(1) || '0',
        timeSpent: record.timeSpent || 0,
        submitTime: record.submitTime
          ? new Date(record.submitTime).toLocaleString('zh-CN')
          : '',
        source: record.source || '',
      });
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle' };
        if (rowNumber % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' },
          };
        }
      }
    });

    await workbook.xlsx.writeFile(filePath);
  }

  async generateMasteryData(
    filePath: string,
    masteryData: KnowledgeMastery[],
    historyData: MasteryHistory[],
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = '学习诊断系统';
    workbook.created = new Date();

    const currentSheet = workbook.addWorksheet('当前掌握度', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    currentSheet.columns = [
      { header: '学生姓名', key: 'studentName', width: 12 },
      { header: '知识点', key: 'knowledgePoint', width: 20 },
      { header: '学科', key: 'subject', width: 12 },
      { header: '掌握度(%)', key: 'masteryLevel', width: 12 },
      { header: '置信度(%)', key: 'confidence', width: 12 },
      { header: '总答题数', key: 'totalQuestions', width: 12 },
      { header: '正确数', key: 'correctCount', width: 10 },
      { header: '错误数', key: 'wrongCount', width: 10 },
      { header: '连续正确', key: 'streak', width: 12 },
      { header: '趋势', key: 'trend', width: 12 },
      { header: '最后答题时间', key: 'lastAnswerTime', width: 22 },
    ];

    const headerRow1 = currentSheet.getRow(1);
    headerRow1.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow1.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF22C55E' },
    };
    headerRow1.alignment = { horizontal: 'center', vertical: 'middle' };

    masteryData.forEach((item) => {
      currentSheet.addRow({
        studentName: item.student?.realName || '未知',
        knowledgePoint: item.knowledgePoint?.name || '未知',
        subject: item.subject?.name || '未知',
        masteryLevel: item.masteryLevel?.toFixed(1) || '0',
        confidence: item.confidence?.toFixed(1) || '0',
        totalQuestions: item.totalQuestions || 0,
        correctCount: item.correctCount || 0,
        wrongCount: item.wrongCount || 0,
        streak: item.streak || 0,
        trend: this.getTrendText(item.masteryTrend),
        lastAnswerTime: item.lastAnswerTime
          ? new Date(item.lastAnswerTime).toLocaleString('zh-CN')
          : '',
      });
    });

    currentSheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle' };
        if (rowNumber % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' },
          };
        }
      }
    });

    const historySheet = workbook.addWorksheet('掌握度趋势', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    historySheet.columns = [
      { header: '学生姓名', key: 'studentName', width: 12 },
      { header: '知识点', key: 'knowledgePoint', width: 20 },
      { header: '掌握度(%)', key: 'masteryLevel', width: 12 },
      { header: '记录日期', key: 'recordDate', width: 22 },
      { header: '数据来源', key: 'source', width: 15 },
    ];

    const headerRow2 = historySheet.getRow(1);
    headerRow2.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow2.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF8B5CF6' },
    };
    headerRow2.alignment = { horizontal: 'center', vertical: 'middle' };

    historyData.forEach((item) => {
      historySheet.addRow({
        studentName: item.student?.realName || '未知',
        knowledgePoint: item.knowledgePoint?.name || '未知',
        masteryLevel: item.masteryLevel?.toFixed(1) || '0',
        recordDate: item.recordDate
          ? new Date(item.recordDate).toLocaleString('zh-CN')
          : '',
        source: '历史记录',
      });
    });

    historySheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle' };
        if (rowNumber % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' },
          };
        }
      }
    });

    await workbook.xlsx.writeFile(filePath);
  }

  async generateQuestionBank(
    filePath: string,
    questions: Question[],
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = '学习诊断系统';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('题库', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    worksheet.columns = [
      { header: '题目ID', key: 'id', width: 10 },
      { header: '学科', key: 'subject', width: 12 },
      { header: '题目类型', key: 'type', width: 15 },
      { header: '难度', key: 'difficulty', width: 10 },
      { header: '题目内容', key: 'content', width: 60 },
      { header: '选项', key: 'options', width: 40 },
      { header: '答案', key: 'answer', width: 30 },
      { header: '解析', key: 'analysis', width: 40 },
      { header: '分数', key: 'score', width: 10 },
      { header: '预计时间(分钟)', key: 'estimatedTime', width: 15 },
      { header: '来源', key: 'source', width: 15 },
      { header: '知识点', key: 'knowledgePoints', width: 30 },
      { header: '状态', key: 'status', width: 10 },
      { header: '正确率(%)', key: 'correctRate', width: 12 },
      { header: '使用次数', key: 'usageCount', width: 12 },
      { header: '创建时间', key: 'createdAt', width: 22 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF59E0B' },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    questions.forEach((q) => {
      const kpNames = q.questionKnowledges
        ?.map((qk) => qk.knowledgePoint?.name)
        .filter(Boolean)
        .join(', ') || '';

      worksheet.addRow({
        id: q.id,
        subject: q.subject?.name || '未知',
        type: this.getQuestionTypeText(q.type),
        difficulty: this.getDifficultyText(q.difficulty),
        content: q.content || '',
        options: q.options ? JSON.stringify(q.options) : '',
        answer: q.answer || '',
        analysis: q.analysis || '',
        score: q.score?.toFixed(1) || '0',
        estimatedTime: q.estimatedTime || '',
        source: q.source || '',
        knowledgePoints: kpNames,
        status: q.status ? '启用' : '禁用',
        correctRate: q.correctRate?.toFixed(1) || '',
        usageCount: q.usageCount || 0,
        createdAt: q.createdAt
          ? new Date(q.createdAt).toLocaleString('zh-CN')
          : '',
      });
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'top', wrapText: true };
        if (rowNumber % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9FAFB' },
          };
        }
      }
    });

    await workbook.xlsx.writeFile(filePath);
  }

  private getTrendText(trend: string): string {
    const trendMap: Record<string, string> = {
      improving: '上升',
      stable: '稳定',
      declining: '下降',
    };
    return trendMap[trend] || trend;
  }

  private getQuestionTypeText(type: string): string {
    const typeMap: Record<string, string> = {
      single_choice: '单选题',
      multiple_choice: '多选题',
      true_false: '判断题',
      fill_blank: '填空题',
      short_answer: '简答题',
      calculation: '计算题',
    };
    return typeMap[type] || type;
  }

  private getDifficultyText(difficulty: number): string {
    const diffMap: Record<number, string> = {
      1: '简单',
      2: '中等',
      3: '较难',
      4: '困难',
    };
    return diffMap[difficulty] || String(difficulty);
  }

  async generateExcel(
    exportType: ExportType,
    filePath: string,
    data: any,
  ): Promise<void> {
    switch (exportType) {
      case ExportType.ANSWER_RECORDS:
        await this.generateAnswerRecords(filePath, data.records);
        break;
      case ExportType.MASTERY_DATA:
        await this.generateMasteryData(
          filePath,
          data.masteryData,
          data.historyData || [],
        );
        break;
      case ExportType.QUESTION_BANK:
        await this.generateQuestionBank(filePath, data.questions);
        break;
      case ExportType.STUDENT_REPORT:
      case ExportType.CLASS_REPORT:
        await this.generateReportExcel(exportType, filePath, data);
        break;
      default:
        throw new Error(`不支持的Excel导出类型: ${exportType}`);
    }
  }

  private async generateReportExcel(
    exportType: ExportType,
    filePath: string,
    data: any,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = '学习诊断系统';
    workbook.created = new Date();

    if (exportType === ExportType.STUDENT_REPORT) {
      const infoSheet = workbook.addWorksheet('个人信息');
      infoSheet.columns = [
        { header: '字段', key: 'field', width: 20 },
        { header: '值', key: 'value', width: 30 },
      ];
      infoSheet.addRow({ field: '姓名', value: data.student?.realName || '' });
      infoSheet.addRow({ field: '用户名', value: data.student?.username || '' });
      infoSheet.addRow({ field: '邮箱', value: data.student?.email || '' });
      infoSheet.addRow({ field: '电话', value: data.student?.phone || '' });
      infoSheet.addRow({ field: '导出时间', value: new Date().toLocaleString('zh-CN') });

      const masterySheet = workbook.addWorksheet('掌握度数据');
      masterySheet.columns = [
        { header: '知识点', key: 'kp', width: 25 },
        { header: '掌握度(%)', key: 'mastery', width: 15 },
        { header: '置信度(%)', key: 'confidence', width: 15 },
        { header: '总答题数', key: 'total', width: 12 },
        { header: '正确数', key: 'correct', width: 12 },
      ];
      data.masteryData?.forEach((m: any) => {
        masterySheet.addRow({
          kp: m.knowledgePoint?.name || '',
          mastery: m.masteryLevel?.toFixed(1) || '0',
          confidence: m.confidence?.toFixed(1) || '0',
          total: m.totalQuestions || 0,
          correct: m.correctCount || 0,
        });
      });

      const weakSheet = workbook.addWorksheet('薄弱点分析');
      weakSheet.columns = [
        { header: '知识点', key: 'kp', width: 25 },
        { header: '掌握度(%)', key: 'mastery', width: 15 },
        { header: '薄弱等级', key: 'level', width: 15 },
        { header: '错误次数', key: 'wrong', width: 12 },
        { header: '建议', key: 'suggestion', width: 40 },
      ];
      data.weakPoints?.forEach((wp: any) => {
        weakSheet.addRow({
          kp: wp.knowledgePoint?.name || '',
          mastery: wp.weaknessScore?.toFixed(1) || '0',
          level: wp.weaknessLevel || '',
          wrong: wp.recommendedPracticeCount || 0,
          suggestion: this.getWeakPointSuggestion(wp.weaknessLevel),
        });
      });
    } else if (exportType === ExportType.CLASS_REPORT) {
      const infoSheet = workbook.addWorksheet('班级信息');
      infoSheet.columns = [
        { header: '字段', key: 'field', width: 20 },
        { header: '值', key: 'value', width: 30 },
      ];
      infoSheet.addRow({ field: '班级名称', value: data.classInfo?.name || '' });
      infoSheet.addRow({ field: '年级', value: data.classInfo?.grade || '' });
      infoSheet.addRow({ field: '学科', value: data.classInfo?.subject || '' });
      infoSheet.addRow({ field: '学生人数', value: data.classInfo?.studentCount || 0 });
      infoSheet.addRow({ field: '授课教师', value: data.classInfo?.teacher?.realName || '' });
      infoSheet.addRow({ field: '导出时间', value: new Date().toLocaleString('zh-CN') });

      const statSheet = workbook.addWorksheet('统计数据');
      statSheet.columns = [
        { header: '指标', key: 'metric', width: 20 },
        { header: '数值', key: 'value', width: 20 },
      ];
      const stat = data.statistics?.[0] || {};
      statSheet.addRow({ metric: '平均正确率', value: `${stat.correctRate?.toFixed(1) || 0}%` });
      statSheet.addRow({ metric: '总答题数', value: stat.totalQuestions || 0 });
      statSheet.addRow({ metric: '参与人数', value: stat.studentCount || 0 });
      statSheet.addRow({ metric: '平均分数', value: `${stat.avgScore?.toFixed(1) || 0}分` });

      const masterySheet = workbook.addWorksheet('知识点掌握');
      masterySheet.columns = [
        { header: '知识点', key: 'kp', width: 25 },
        { header: '平均掌握度(%)', key: 'avgMastery', width: 18 },
        { header: '掌握人数', key: 'mastered', width: 12 },
        { header: '未掌握人数', key: 'notMastered', width: 15 },
      ];

      const masteryByKp = new Map<number, { total: number; count: number; name: string }>();
      data.masteryData?.forEach((m: any) => {
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
        masterySheet.addRow({
          kp: item.name,
          avgMastery: avg.toFixed(1),
          mastered: Math.floor(item.count * (avg / 100)),
          notMastered: item.count - Math.floor(item.count * (avg / 100)),
        });
      }
    }

    [1, 2, 3].forEach((sheetIndex) => {
      const sheet = workbook.worksheets[sheetIndex];
      if (sheet) {
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2563EB' },
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });

    await workbook.xlsx.writeFile(filePath);
  }

  private getWeakPointSuggestion(level: string): string {
    const suggestions: Record<string, string> = {
      critical: '紧急加强，建议每日专项练习',
      high: '重点关注，建议优先复习',
      medium: '需要加强，建议增加练习',
      low: '持续关注，保持练习频率',
    };
    return suggestions[level] || '继续保持';
  }
}
