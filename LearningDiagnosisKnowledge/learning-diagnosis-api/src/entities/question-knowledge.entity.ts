import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Question } from './question.entity';
import { KnowledgePoint } from './knowledge-point.entity';

@Entity('question_knowledge')
export class QuestionKnowledge extends BaseEntity {
  @Column({ name: 'question_id', type: 'bigint', unsigned: true })
  questionId: number;

  @Column({ name: 'knowledge_point_id', type: 'bigint', unsigned: true })
  knowledgePointId: number;

  @Column({ name: 'mastery_level', type: 'tinyint', default: 1 })
  masteryLevel: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  weight: number;

  @Column({ name: 'is_primary', type: 'tinyint', default: 0 })
  isPrimary: number;

  @ManyToOne(() => Question, (q) => q.questionKnowledges)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => KnowledgePoint, (kp) => kp.questionKnowledges)
  @JoinColumn({ name: 'knowledge_point_id' })
  knowledgePoint: KnowledgePoint;
}
