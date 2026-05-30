import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';
import { KnowledgePoint } from './knowledge-point.entity';
import { Subject } from './subject.entity';
import { MasteryTrend } from '../common/types';

@Entity('knowledge_mastery')
@Index('idx_student_subject', ['studentId', 'subjectId'])
@Index('idx_mastery_student', ['masteryLevel', 'studentId'])
export class KnowledgeMastery extends BaseEntity {
  @Column({ name: 'student_id', type: 'bigint', unsigned: true })
  studentId: number;

  @Column({ name: 'knowledge_point_id', type: 'bigint', unsigned: true })
  knowledgePointId: number;

  @Column({ name: 'subject_id', type: 'bigint', unsigned: true })
  subjectId: number;

  @Column({
    name: 'mastery_level',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  masteryLevel: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  confidence: number;

  @Column({ name: 'total_questions', type: 'int', default: 0 })
  totalQuestions: number;

  @Column({ name: 'correct_count', type: 'int', default: 0 })
  correctCount: number;

  @Column({ name: 'wrong_count', type: 'int', default: 0 })
  wrongCount: number;

  @Column({ type: 'int', default: 0 })
  streak: number;

  @Column({ name: 'last_answer_time', type: 'datetime', nullable: true })
  lastAnswerTime?: Date;

  @Column({ name: 'first_answer_time', type: 'datetime', nullable: true })
  firstAnswerTime?: Date;

  @Column({
    name: 'forgetting_curve',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 1.0,
  })
  forgettingCurve: number;

  @Column({
    name: 'mastery_trend',
    type: 'enum',
    enum: MasteryTrend,
    default: MasteryTrend.STABLE,
  })
  masteryTrend: MasteryTrend;

  @Column({
    name: 'model_version',
    type: 'varchar',
    length: 50,
    default: 'v1.0',
  })
  modelVersion: string;

  @Column({ name: 'calculation_details', type: 'json', nullable: true })
  calculationDetails?: any;

  @ManyToOne(() => User)
  student: User;

  @ManyToOne(() => KnowledgePoint)
  knowledgePoint: KnowledgePoint;

  @ManyToOne(() => Subject)
  subject: Subject;
}
