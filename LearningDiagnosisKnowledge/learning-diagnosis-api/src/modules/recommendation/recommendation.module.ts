import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { Recommendation } from '../../entities/recommendation.entity';
import { KnowledgeMastery } from '../../entities/knowledge-mastery.entity';
import { WeakPoint } from '../../entities/weak-point.entity';
import { Question } from '../../entities/question.entity';
import { Exercise } from '../../entities/exercise.entity';
import { QuestionKnowledge } from '../../entities/question-knowledge.entity';
import { KnowledgePoint } from '../../entities/knowledge-point.entity';
import { KnowledgeRelation } from '../../entities/knowledge-relation.entity';
import { ExerciseQuestion } from '../../entities/exercise-question.entity';
import { MasteryCalculatorService } from '../../common/services/mastery-calculator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recommendation,
      KnowledgeMastery,
      WeakPoint,
      Question,
      Exercise,
      QuestionKnowledge,
      KnowledgePoint,
      KnowledgeRelation,
      ExerciseQuestion,
    ]),
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService, MasteryCalculatorService],
  exports: [RecommendationService],
})
export class RecommendationModule {}
