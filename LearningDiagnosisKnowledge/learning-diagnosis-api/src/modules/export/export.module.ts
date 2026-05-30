import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { AuditLog } from '../../entities/audit-log.entity';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { PdfService } from './pdf.service';
import { ExcelService } from './excel.service';
import { AuditService } from '../../common/services/audit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExportRecord,
      User,
      KnowledgeMastery,
      WeakPoint,
      ClassEntity,
      ClassStatistics,
      ClassStudent,
      AnswerRecord,
      MasteryHistory,
      Question,
      AuditLog,
    ]),
  ],
  controllers: [ExportController],
  providers: [ExportService, PdfService, ExcelService, AuditService],
  exports: [ExportService],
})
export class ExportModule {}
