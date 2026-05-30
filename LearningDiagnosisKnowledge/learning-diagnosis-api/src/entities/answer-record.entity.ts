import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { User } from './user.entity';
import { Exercise } from './exercise.entity';
import { Question } from './question.entity';
import { Subject } from './subject.entity';

@Entity('answer_records')
@Index('idx_student_question', ['studentId', 'questionId'])
export class AnswerRecord extends BaseEntity {
  @Column({ name: 'student_id', type: 'bigint', unsigned: true })
  studentId: number;

  @Column({
    name: 'exercise_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  exerciseId?: number;

  @Column({ name: 'question_id', type: 'bigint', unsigned: true })
  questionId: number;

  @Column({ name: 'subject_id', type: 'bigint', unsigned: true })
  subjectId: number;

  @Column({ name: 'student_answer', type: 'text', nullable: true })
  studentAnswer?: string;

  @Column({ name: 'is_correct', type: 'tinyint', nullable: true })
  isCorrect?: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  score?: number;

  @Column({ name: 'time_spent', type: 'int', nullable: true })
  timeSpent?: number;

  @Column({ name: 'start_time', type: 'datetime', nullable: true })
  startTime?: Date;

  @Column({ name: 'submit_time', type: 'datetime' })
  submitTime: Date;

  @Column({ name: 'answer_metadata', type: 'json', nullable: true })
  answerMetadata?: any;

  @Column({ type: 'varchar', length: 50, default: 'manual' })
  source: string;

  @ManyToOne(() => User)
  student: User;

  @ManyToOne(() => Exercise)
  exercise?: Exercise;

  @ManyToOne(() => Question)
  question: Question;

  @ManyToOne(() => Subject)
  subject: Subject;
}
