import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Exercise } from './exercise.entity';
import { Question } from './question.entity';

@Entity('exercise_questions')
export class ExerciseQuestion extends BaseEntity {
  @Column({ name: 'exercise_id', type: 'bigint', unsigned: true })
  exerciseId: number;

  @Column({ name: 'question_id', type: 'bigint', unsigned: true })
  questionId: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @ManyToOne(() => Exercise, (e) => e.exerciseQuestions)
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @ManyToOne(() => Question, (q) => q.exerciseQuestions)
  @JoinColumn({ name: 'question_id' })
  question: Question;
}
