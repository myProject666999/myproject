import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasteryController } from './mastery.controller';
import { MasteryService } from './mastery.service';
import { WeakPointController } from './weak-point.controller';
import { WeakPointService } from './weak-point.service';
import { KnowledgeMastery } from '../../entities/knowledge-mastery.entity';
import { MasteryHistory } from '../../entities/mastery-history.entity';
import { WeakPoint } from '../../entities/weak-point.entity';
import { KnowledgePoint } from '../../entities/knowledge-point.entity';
import { AnswerRecord } from '../../entities/answer-record.entity';
import { QuestionKnowledge } from '../../entities/question-knowledge.entity';
import { ClassStudent } from '../../entities/class-student.entity';
import { ClassEntity } from '../../entities/class.entity';
import { User } from '../../entities/user.entity';
import { MasteryCalculatorService } from '../../common/services/mastery-calculator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      KnowledgeMastery,
      MasteryHistory,
      WeakPoint,
      KnowledgePoint,
      AnswerRecord,
      QuestionKnowledge,
      ClassStudent,
      ClassEntity,
      User,
    ]),
  ],
  controllers: [MasteryController, WeakPointController],
  providers: [MasteryService, WeakPointService, MasteryCalculatorService],
  exports: [MasteryService, WeakPointService],
})
export class MasteryModule {}
