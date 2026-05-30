import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';
import { Subject } from './subject.entity';
import { Exercise } from './exercise.entity';
import { RecommendationType } from '../common/types';

@Entity('recommendations')
export class Recommendation extends BaseEntity {
  @Column({ name: 'student_id', type: 'bigint', unsigned: true })
  studentId: number;

  @Column({ name: 'subject_id', type: 'bigint', unsigned: true })
  subjectId: number;

  @Column({
    name: 'exercise_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  exerciseId?: number;

  @Column({
    type: 'enum',
    enum: RecommendationType,
  })
  type: RecommendationType;

  @Column({ name: 'target_knowledge_points', type: 'json', nullable: true })
  targetKnowledgePoints?: any;

  @Column({ name: 'recommendation_reason', type: 'text', nullable: true })
  recommendationReason?: string;

  @Column({ name: 'total_questions', type: 'int' })
  totalQuestions: number;

  @Column({
    name: 'difficulty_range',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  difficultyRange?: string;

  @Column({ name: 'is_completed', type: 'tinyint', default: 0 })
  isCompleted: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  score?: number;

  @Column({ name: 'recommended_at', type: 'datetime' })
  recommendedAt: Date;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt?: Date;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expiresAt?: Date;

  @Column({
    name: 'algorithm_version',
    type: 'varchar',
    length: 50,
    default: 'v1.0',
  })
  algorithmVersion: string;

  @ManyToOne(() => User)
  student: User;

  @ManyToOne(() => Subject)
  subject: Subject;

  @ManyToOne(() => Exercise)
  exercise?: Exercise;
}
