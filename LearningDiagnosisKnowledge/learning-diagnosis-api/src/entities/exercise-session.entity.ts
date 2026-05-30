import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';
import { Exercise } from './exercise.entity';
import { ClassEntity } from './class.entity';

@Entity('exercise_sessions')
export class ExerciseSession extends BaseEntity {
  @Column({ name: 'student_id', type: 'bigint', unsigned: true })
  studentId: number;

  @Column({ name: 'exercise_id', type: 'bigint', unsigned: true })
  exerciseId: number;

  @Column({ name: 'class_id', type: 'bigint', unsigned: true, nullable: true })
  classId?: number;

  @Column({ name: 'start_time', type: 'datetime' })
  startTime: Date;

  @Column({ name: 'submit_time', type: 'datetime', nullable: true })
  submitTime?: Date;

  @Column({
    name: 'total_score',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  totalScore?: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  score?: number;

  @Column({ name: 'correct_count', type: 'int', nullable: true })
  correctCount?: number;

  @Column({ name: 'wrong_count', type: 'int', nullable: true })
  wrongCount?: number;

  @Column({ name: 'time_spent', type: 'int', nullable: true })
  timeSpent?: number;

  @Column({
    type: 'enum',
    enum: ['in_progress', 'submitted', 'graded'],
    default: 'in_progress',
  })
  status: string;

  @ManyToOne(() => User)
  student: User;

  @ManyToOne(() => Exercise)
  exercise: Exercise;

  @ManyToOne(() => ClassEntity)
  class?: ClassEntity;
}
