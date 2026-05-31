import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';
import { KnowledgePoint } from './knowledge-point.entity';
import { Subject } from './subject.entity';
import { WeaknessLevel } from '../common/types';

@Entity('weak_points')
export class WeakPoint extends BaseEntity {
  @Column({ name: 'student_id', type: 'bigint', unsigned: true })
  studentId: number;

  @Column({ name: 'knowledge_point_id', type: 'bigint', unsigned: true })
  knowledgePointId: number;

  @Column({ name: 'subject_id', type: 'bigint', unsigned: true })
  subjectId: number;

  @Column({ name: 'weakness_score', type: 'decimal', precision: 5, scale: 2 })
  weaknessScore: number;

  @Column({
    name: 'weakness_level',
    type: 'enum',
    enum: WeaknessLevel,
  })
  weaknessLevel: WeaknessLevel;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ name: 'related_wrong_questions', type: 'json', nullable: true })
  relatedWrongQuestions?: any;

  @Column({ name: 'recommended_practice_count', type: 'int', default: 0 })
  recommendedPracticeCount: number;

  @Column({ name: 'practice_since_detected', type: 'int', default: 0 })
  practiceSinceDetected: number;

  @Column({
    name: 'improvement_since_detected',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  improvementSinceDetected?: number;

  @Column({ name: 'is_improving', type: 'tinyint', default: 0 })
  isImproving: number;

  @Column({ name: 'detected_at', type: 'datetime' })
  detectedAt: Date;

  @Column({ name: 'last_updated_at', type: 'datetime' })
  lastUpdatedAt: Date;

  @Column({ name: 'is_resolved', type: 'tinyint', default: 0 })
  isResolved: number;

  @Column({ name: 'resolved_at', type: 'datetime', nullable: true })
  resolvedAt?: Date;

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
