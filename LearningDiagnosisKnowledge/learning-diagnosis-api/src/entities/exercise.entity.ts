import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Subject } from './subject.entity';
import { User } from './user.entity';
import { ExerciseType } from '../common/types';
import { ExerciseQuestion } from './exercise-question.entity';
import { ExerciseSession } from './exercise-session.entity';
import { Recommendation } from './recommendation.entity';

@Entity('exercises')
export class Exercise extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ name: 'subject_id', type: 'bigint', unsigned: true })
  subjectId: number;

  @Column({
    name: 'creator_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  creatorId?: number;

  @Column({
    type: 'enum',
    enum: ExerciseType,
  })
  type: ExerciseType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'total_score',
    type: 'decimal',
    precision: 8,
    scale: 2,
    default: 100.0,
  })
  totalScore: number;

  @Column({ name: 'total_questions', type: 'int', default: 0 })
  totalQuestions: number;

  @Column({ name: 'time_limit', type: 'int', nullable: true })
  timeLimit?: number;

  @Column({ name: 'is_public', type: 'tinyint', default: 0 })
  isPublic: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @ManyToOne(() => Subject, (subject) => subject.exercises)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @OneToMany(() => ExerciseQuestion, (eq) => eq.exercise)
  exerciseQuestions: ExerciseQuestion[];

  @OneToMany(() => ExerciseSession, (es) => es.exercise)
  exerciseSessions: ExerciseSession[];

  @OneToMany(() => Recommendation, (r) => r.exercise)
  recommendations: Recommendation[];
}
