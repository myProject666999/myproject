import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { LearningReport } from '../../entities/learning-report.entity';
import { KnowledgeMastery } from '../../entities/knowledge-mastery.entity';
import { WeakPoint } from '../../entities/weak-point.entity';
import { AnswerRecord } from '../../entities/answer-record.entity';
import { ClassStatistics } from '../../entities/class-statistics.entity';
import { ExerciseSession } from '../../entities/exercise-session.entity';
import { ClassStudent } from '../../entities/class-student.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningReport,
      KnowledgeMastery,
      WeakPoint,
      AnswerRecord,
      ClassStatistics,
      ExerciseSession,
      ClassStudent,
      User,
    ]),
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
