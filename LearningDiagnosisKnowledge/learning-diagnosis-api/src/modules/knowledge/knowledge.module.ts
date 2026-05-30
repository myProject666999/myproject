import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from '../../entities/subject.entity';
import { KnowledgePoint } from '../../entities/knowledge-point.entity';
import { KnowledgeRelation } from '../../entities/knowledge-relation.entity';
import { SubjectController } from './subject.controller';
import { SubjectService } from './subject.service';
import { KnowledgePointController } from './knowledge-point.controller';
import { KnowledgePointService } from './knowledge-point.service';
import { KnowledgeRelationController } from './knowledge-relation.controller';
import { KnowledgeRelationService } from './knowledge-relation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subject, KnowledgePoint, KnowledgeRelation]),
  ],
  controllers: [
    SubjectController,
    KnowledgePointController,
    KnowledgeRelationController,
  ],
  providers: [SubjectService, KnowledgePointService, KnowledgeRelationService],
  exports: [SubjectService, KnowledgePointService, KnowledgeRelationService],
})
export class KnowledgeModule {}
