import { Entity, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';
import { KnowledgePoint } from './knowledge-point.entity';
import { Subject } from './subject.entity';

@Entity('mastery_history')
@Index('idx_student_date', ['studentId', 'recordDate'])
export class MasteryHistory extends BaseEntity {
  @Column({ name: 'student_id', type: 'bigint', unsigned: true })
  studentId: number;

  @Column({ name: 'knowledge_point_id', type: 'bigint', unsigned: true })
  knowledgePointId: number;

  @Column({ name: 'subject_id', type: 'bigint', unsigned: true })
  subjectId: number;

  @Column({ name: 'mastery_level', type: 'decimal', precision: 5, scale: 2 })
  masteryLevel: number;

  @Column({ name: 'record_date', type: 'date' })
  recordDate: Date;

  @Column({ name: 'total_questions', type: 'int', default: 0 })
  totalQuestions: number;

  @Column({ name: 'correct_count', type: 'int', default: 0 })
  correctCount: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => KnowledgePoint)
  @JoinColumn({ name: 'knowledge_point_id' })
  knowledgePoint: KnowledgePoint;

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;
}
