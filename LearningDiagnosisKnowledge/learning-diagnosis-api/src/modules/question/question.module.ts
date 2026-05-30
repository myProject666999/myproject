import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '../../entities/question.entity';
import { QuestionKnowledge } from '../../entities/question-knowledge.entity';
import { Exercise } from '../../entities/exercise.entity';
import { ExerciseQuestion } from '../../entities/exercise-question.entity';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      QuestionKnowledge,
      Exercise,
      ExerciseQuestion,
    ]),
  ],
  controllers: [QuestionController, ExerciseController],
  providers: [QuestionService, ExerciseService],
  exports: [QuestionService, ExerciseService],
})
export class QuestionModule {}
