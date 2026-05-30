import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from '../../entities/class.entity';
import { ClassStudent } from '../../entities/class-student.entity';
import { ClassStatistics } from '../../entities/class-statistics.entity';
import { KnowledgeMastery } from '../../entities/knowledge-mastery.entity';
import { WeakPoint } from '../../entities/weak-point.entity';
import { KnowledgePoint } from '../../entities/knowledge-point.entity';
import { Subject } from '../../entities/subject.entity';
import { User } from '../../entities/user.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { ClassStatisticsService } from './class-statistics.service';
import { AuditService } from '../../common/services/audit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassEntity,
      ClassStudent,
      ClassStatistics,
      KnowledgeMastery,
      WeakPoint,
      KnowledgePoint,
      Subject,
      User,
      AuditLog,
    ]),
  ],
  controllers: [ClassController],
  providers: [ClassService, ClassStatisticsService, AuditService],
  exports: [ClassService, ClassStatisticsService],
})
export class ClassModule {}
