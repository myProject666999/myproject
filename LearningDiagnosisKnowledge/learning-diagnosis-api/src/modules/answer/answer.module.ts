import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerController } from './answer.controller';
import { AnswerService } from './answer.service';
import { ExerciseSessionController } from './exercise-session.controller';
import { ExerciseSessionService } from './exercise-session.service';
import { AnswerRecord } from '../../entities/answer-record.entity';
import { ExerciseSession } from '../../entities/exercise-session.entity';
import { Question } from '../../entities/question.entity';
import { Exercise } from '../../entities/exercise.entity';
import { MasteryCalculatorService } from '../../common/services/mastery-calculator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnswerRecord, ExerciseSession, Question, Exercise]),
  ],
  controllers: [AnswerController, ExerciseSessionController],
  providers: [AnswerService, ExerciseSessionService, MasteryCalculatorService],
  exports: [AnswerService, ExerciseSessionService],
})
export class AnswerModule {}
