import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');
import * as fs from 'fs';
import * as path from 'path';

type PDFDoc = any;
import { User } from '../../entities/user.entity';
import { KnowledgeMastery } from '../../entities/knowledge-mastery.entity';
import { WeakPoint } from '../../entities/weak-point.entity';
import { ClassEntity } from '../../entities/class.entity';
import { ClassStatistics } from '../../entities/class-statistics.entity';
import { ExportType } from '../../common/types';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generateStudentReport(
    filePath: string,
    student: User,
    masteryData: KnowledgeMastery[],
    weakPoints: WeakPoint[],
    subjectId?: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          bufferPages: true,
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        this.drawHeader(doc, '学生学情报告');
        this.drawStudentInfo(doc, student);
        this.drawMasteryChart(doc, masteryData, 280);
        this.drawWeakPoints(doc, weakPoints, 450);
        this.drawRecommendations(doc, weakPoints, 650);
        this.drawFooter(doc);

        doc.end();

        stream.on('finish', () => resolve());
        stream.on('error', (err) => reject(err));
      } catch (error) {
        this.logger.error('生成学生报告PDF失败:', error);
        reject(error);
      }
    });
  }

  async generateClassReport(
    filePath: string,
    classInfo: ClassEntity,
    statistics: ClassStatistics[],
    masteryData: KnowledgeMastery[],
    studentList: User[],
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          bufferPages: true,
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        this.drawHeader(doc, '班级学情报告');
        this.drawClassInfo(doc, classInfo);
        this.drawClassStatistics(doc, statistics, 280);
        this.drawClassMastery(doc, masteryData, 450);
        this.drawStudentDistribution(doc, studentList, masteryData, 620);
        this.drawFooter(doc);

        doc.end();

        stream.on('finish', () => resolve());
        stream.on('error', (err) => reject(err));
      } catch (error) {
        this.logger.error('生成班级报告PDF失败:', error);
        reject(error);
      }
    });
  }

  private drawHeader(doc: PDFDoc, title: string): void {
    doc
      .fillColor('#2563eb')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text(title, { align: 'center' })
      .moveDown(0.5);

    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .moveTo(50, 100)
      .lineTo(545, 100)
      .stroke();

    doc
      .fillColor('#6b7280')
      .fontSize(12)
      .font('Helvetica')
      .text(`生成时间: ${new Date().toLocaleString('zh-CN')}`, 50, 110)
      .moveDown(2);
  }

  private drawStudentInfo(doc: PDFDoc, student: User): void {
    doc
      .fillColor('#1f2937')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('一、个人信息', 50, 150)
      .moveDown(0.5);

    const infoY = 185;
    const infoItems = [
      { label: '姓名', value: student.realName },
      { label: '用户名', value: student.username },
      { label: '邮箱', value: student.email || '未设置' },
      { label: '电话', value: student.phone || '未设置' },
    ];

    doc.fontSize(12).font('Helvetica');
    infoItems.forEach((item, index) => {
      const x = index % 2 === 0 ? 50 : 320;
      const y = infoY + Math.floor(index / 2) * 30;
      doc
        .fillColor('#6b7280')
        .text(`${item.label}:`, x, y)
        .fillColor('#1f2937')
        .text(item.value, x + 60, y);
    });

    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .moveTo(50, 250)
      .lineTo(545, 250)
      .stroke();
  }

  private drawMasteryChart(
    doc: PDFDoc,
    masteryData: KnowledgeMastery[],
    startY: number,
  ): void {
    doc
      .fillColor('#1f2937')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('二、掌握度图谱', 50, startY)
      .moveDown(0.5);

    if (!masteryData || masteryData.length === 0) {
      doc
        .fillColor('#6b7280')
        .fontSize(12)
        .font('Helvetica')
        .text('暂无掌握度数据', 50, startY + 35);
      return;
    }

    const chartX = 50;
    const chartY = startY + 35;
    const chartWidth = 495;
    const chartHeight = 120;
    const barWidth = Math.min(40, (chartWidth - 40) / masteryData.length);
    const gap = (chartWidth - barWidth * masteryData.length) / (masteryData.length + 1);

    doc
      .strokeColor('#e5e7eb')
      .lineWidth(0.5)
      .moveTo(chartX, chartY)
      .lineTo(chartX, chartY + chartHeight)
      .lineTo(chartX + chartWidth, chartY + chartHeight)
      .stroke();

    for (let i = 0; i <= 4; i++) {
      const y = chartY + chartHeight - (chartHeight / 4) * i;
      doc
        .strokeColor('#f3f4f6')
        .moveTo(chartX, y)
        .lineTo(chartX + chartWidth, y)
        .stroke();
      doc
        .fillColor('#9ca3af')
        .fontSize(10)
        .text(`${i * 25}%`, chartX - 35, y - 5);
    }

    const colors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];
    masteryData.forEach((item, index) => {
      const x = chartX + gap + index * (barWidth + gap);
      const height = (item.masteryLevel / 100) * chartHeight;
      const color = colors[Math.floor((4 - Math.floor(item.masteryLevel / 25)))];

      doc
        .fillColor(color)
        .rect(x, chartY + chartHeight - height, barWidth, height)
        .fill();

      if (item.knowledgePoint) {
        const name = item.knowledgePoint.name || '未知';
        const displayName = name.length > 4 ? name.substring(0, 4) + '...' : name;
        doc
          .fillColor('#6b7280')
          .fontSize(9)
          .text(displayName, x, chartY + chartHeight + 5, { width: barWidth, align: 'center' });
      }

      doc
        .fillColor('#1f2937')
        .fontSize(10)
        .text(`${item.masteryLevel.toFixed(0)}%`, x, chartY + chartHeight - height - 15, {
          width: barWidth,
          align: 'center',
        });
    });
  }

  private drawWeakPoints(
    doc: PDFDoc,
    weakPoints: WeakPoint[],
    startY: number,
  ): void {
    doc
      .fillColor('#1f2937')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('三、薄弱点分析', 50, startY)
      .moveDown(0.5);

    if (!weakPoints || weakPoints.length === 0) {
      doc
        .fillColor('#6b7280')
        .fontSize(12)
        .font('Helvetica')
        .text('暂无薄弱点数据', 50, startY + 35);
      return;
    }

    const tableY = startY + 35;
    const headers = ['知识点', '掌握度', '薄弱等级', '错误次数'];
    const colWidths = [200, 100, 100, 95];
    const colX = [50, 250, 350, 450];

    doc
      .fillColor('#f3f4f6')
      .rect(50, tableY, 495, 25)
      .fill();

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#374151');
    headers.forEach((header, i) => {
      doc.text(header, colX[i] + 5, tableY + 7);
    });

    weakPoints.slice(0, 5).forEach((wp, index) => {
      const rowY = tableY + 25 + index * 25;
      const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';

      doc.fillColor(bgColor).rect(50, rowY, 495, 25).fill();

      const levelColor =
        wp.weaknessLevel === 'critical'
          ? '#ef4444'
          : wp.weaknessLevel === 'high'
          ? '#f97316'
          : wp.weaknessLevel === 'medium'
          ? '#eab308'
          : '#22c55e';

      doc.fontSize(10).font('Helvetica').fillColor('#1f2937');
      doc.text(wp.knowledgePoint?.name || '未知', colX[0] + 5, rowY + 7);
      doc.text(`${wp.weaknessScore?.toFixed(1)}%`, colX[1] + 5, rowY + 7);
      doc.fillColor(levelColor).text(wp.weaknessLevel, colX[2] + 5, rowY + 7);
      doc.fillColor('#1f2937').text(String(wp.recommendedPracticeCount || 0), colX[3] + 5, rowY + 7);
    });
  }

  private drawRecommendations(
    doc: PDFDoc,
    weakPoints: WeakPoint[],
    startY: number,
  ): void {
    doc
      .fillColor('#1f2937')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('四、学习建议', 50, startY)
      .moveDown(0.5);

    doc.fontSize(12).font('Helvetica').fillColor('#374151');

    const suggestions = [
      '针对薄弱知识点，建议进行专项练习，每天安排15-20分钟的针对性训练。',
      '优先攻克 critical 和 high 级别的薄弱点，这些是提升成绩的关键。',
      '对于掌握度低于60%的知识点，建议回顾相关教材和笔记，理解基础概念。',
      '定期复习已掌握的知识点，防止遗忘，保持学习的连贯性。',
      '建议每周进行一次自我测试，检验学习效果，及时调整学习计划。',
    ];

    if (weakPoints && weakPoints.length > 0) {
      const topWeak = weakPoints[0];
      suggestions.unshift(
        `您在"${topWeak.knowledgePoint?.name || '薄弱知识点'}"方面需要加强，建议优先复习。`,
      );
    }

    suggestions.forEach((suggestion, index) => {
      const y = startY + 35 + index * 25;
      doc
        .fillColor('#2563eb')
        .circle(60, y + 8, 4)
        .fill();
      doc.fillColor('#374151').text(suggestion, 75, y, { width: 465 });
    });
  }

  private drawClassInfo(doc: PDFDoc, classInfo: ClassEntity): void {
    doc
      .fillColor('#1f2937')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('一、班级信息', 50, 150)
      .moveDown(0.5);

    const infoY = 185;
    const infoItems = [
      { label: '班级名称', value: classInfo.name },
      { label: '年级', value: classInfo.grade },
      { label: '学科', value: classInfo.subject || '未设置' },
      { label: '学生人数', value: String(classInfo.studentCount || 0) },
      { label: '授课教师', value: classInfo.teacher?.realName || '未分配' },
      { label: '班级描述', value: classInfo.description || '无' },
    ];

    doc.fontSize(12).font('Helvetica');
    infoItems.forEach((item, index) => {
      const x = index % 2 === 0 ? 50 : 320;
      const y = infoY + Math.floor(index / 2) * 30;
      doc
        .fillColor('#6b7280')
        .text(`${item.label}:`, x, y)
        .fillColor('#1f2937')
        .text(item.value, x + 65, y);
    });

    doc
      .strokeColor('#e5e7eb')
      .lineWidth(1)
      .moveTo(50, 270)
      .lineTo(545, 270)
      .stroke();
  }

  private drawClassStatistics(
    doc: PDFDoc,
    statistics: ClassStatistics[],
    startY: number,
  ): void {
    doc
      .fillColor('#1f2937')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('二、整体统计', 50, startY)
      .moveDown(0.5);

    if (!statistics || statistics.length === 0) {
      doc
        .fillColor('#6b7280')
        .fontSize(12)
        .font('Helvetica')
        .text('暂无统计数据', 50, startY + 35);
      return;
    }

    const stat = statistics[0];
    const stats = [
      { label: '平均正确率', value: `${stat.correctRate?.toFixed(1) || 0}%`, color: '#22c55e' },
      { label: '总答题数', value: String(stat.totalQuestions || 0), color: '#3b82f6' },
      { label: '参与人数', value: String(stat.studentCount || 0), color: '#8b5cf6' },
      { label: '平均分数', value: `${stat.avgScore?.toFixed(1) || 0}分`, color: '#f59e0b' },
    ];

    stats.forEach((item, index) => {
      const x = 50 + index * 125;
      const y = startY + 35;

      doc
        .fillColor('#f3f4f6')
        .roundedRect(x, y, 115, 60, 8)
        .fill();

      doc
        .fillColor(item.color)
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(item.value, x, y + 12, { width: 115, align: 'center' });

      doc
        .fillColor('#6b7280')
        .fontSize(11)
        .font('Helvetica')
        .text(item.label, x, y + 40, { width: 115, align: 'center' });
    });
  }

  private drawClassMastery(
    doc: PDFDoc,
    masteryData: KnowledgeMastery[],
    startY: number,
  ): void {
    doc
      .fillColor('#1f2937')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('三、知识点掌握情况', 50, startY)
      .moveDown(0.5);

    if (!masteryData || masteryData.length === 0) {
      doc
        .fillColor('#6b7280')
        .fontSize(12)
        .font('Helvetica')
        .text('暂无掌握度数据', 50, startY + 35);
      return;
    }

    const tableY = startY + 35;
    const headers = ['知识点', '平均掌握度', '掌握人数', '未掌握人数'];
    const colWidths = [200, 110, 95, 90];
    const colX = [50, 250, 360, 455];

    doc
      .fillColor('#f3f4f6')
      .rect(50, tableY, 495, 25)
      .fill();

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#374151');
    headers.forEach((header, i) => {
      doc.text(header, colX[i] + 5, tableY + 7);
    });

    const masteryByKp = new Map<number, { total: number; count: number; name: string }>();
    masteryData.forEach((m) => {
      const existing = masteryByKp.get(m.knowledgePointId) || {
        total: 0,
        count: 0,
        name: m.knowledgePoint?.name || '未知',
      };
      existing.total += m.masteryLevel;
      existing.count += 1;
      masteryByKp.set(m.knowledgePointId, existing);
    });

    let index = 0;
    for (const [, data] of masteryByKp) {
      if (index >= 5) break;
      const rowY = tableY + 25 + index * 25;
      const avgMastery = data.total / data.count;
      const masteredCount = Math.floor(data.count * (avgMastery / 100));
      const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';

      doc.fillColor(bgColor).rect(50, rowY, 495, 25).fill();

      doc.fontSize(10).font('Helvetica').fillColor('#1f2937');
      doc.text(data.name, colX[0] + 5, rowY + 7);
      doc.text(`${avgMastery.toFixed(1)}%`, colX[1] + 5, rowY + 7);
      doc.text(String(masteredCount), colX[2] + 5, rowY + 7);
      doc.text(String(data.count - masteredCount), colX[3] + 5, rowY + 7);
      index++;
    }
  }

  private drawStudentDistribution(
    doc: PDFDoc,
    studentList: User[],
    masteryData: KnowledgeMastery[],
    startY: number,
  ): void {
    doc
      .fillColor('#1f2937')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('四、学生分布', 50, startY)
      .moveDown(0.5);

    const levels = [
      { range: '90-100%', label: '优秀', count: 0, color: '#22c55e' },
      { range: '75-89%', label: '良好', count: 0, color: '#84cc16' },
      { range: '60-74%', label: '及格', count: 0, color: '#eab308' },
      { range: '0-59%', label: '待提高', count: 0, color: '#ef4444' },
    ];

    if (masteryData && masteryData.length > 0) {
      const studentAvg = new Map<number, { total: number; count: number }>();
      masteryData.forEach((m) => {
        const existing = studentAvg.get(m.studentId) || { total: 0, count: 0 };
        existing.total += m.masteryLevel;
        existing.count += 1;
        studentAvg.set(m.studentId, existing);
      });

      studentAvg.forEach((data) => {
        const avg = data.total / data.count;
        if (avg >= 90) levels[0].count++;
        else if (avg >= 75) levels[1].count++;
        else if (avg >= 60) levels[2].count++;
        else levels[3].count++;
      });
    }

    const total = levels.reduce((sum, l) => sum + l.count, 0) || 1;
    const barMaxWidth = 300;
    const barStartX = 180;

    levels.forEach((level, index) => {
      const y = startY + 40 + index * 40;
      const width = (level.count / total) * barMaxWidth;

      doc
        .fillColor('#1f2937')
        .fontSize(12)
        .font('Helvetica')
        .text(`${level.label} (${level.range})`, 50, y + 8);

      doc
        .fillColor(level.color)
        .roundedRect(barStartX, y, width, 25, 4)
        .fill();

      doc
        .fillColor('#ffffff')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`${level.count}人`, barStartX + 10, y + 7);

      doc
        .fillColor('#6b7280')
        .fontSize(11)
        .text(`${((level.count / total) * 100).toFixed(1)}%`, barStartX + width + 10, y + 7);
    });
  }

  private drawFooter(doc: PDFDoc): void {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      const bottom = doc.page.height - 30;

      doc
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .moveTo(50, bottom - 10)
        .lineTo(545, bottom - 10)
        .stroke();

      doc
        .fillColor('#9ca3af')
        .fontSize(10)
        .font('Helvetica')
        .text('学习诊断系统 - 学情报告', 50, bottom)
        .text(`第 ${i + 1} 页 / 共 ${pages.count} 页`, 450, bottom, { align: 'right' });
    }
  }

  async generatePdf(
    exportType: ExportType,
    filePath: string,
    data: any,
  ): Promise<void> {
    switch (exportType) {
      case ExportType.STUDENT_REPORT:
        await this.generateStudentReport(
          filePath,
          data.student,
          data.masteryData,
          data.weakPoints,
          data.subjectId,
        );
        break;
      case ExportType.CLASS_REPORT:
        await this.generateClassReport(
          filePath,
          data.classInfo,
          data.statistics,
          data.masteryData,
          data.studentList,
        );
        break;
      default:
        throw new Error(`不支持的PDF导出类型: ${exportType}`);
    }
  }
}
