import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Subject } from './subject.entity';
import { User } from './user.entity';
import { QuestionType } from '../common/types';
import { QuestionKnowledge } from './question-knowledge.entity';
import { ExerciseQuestion } from './exercise-question.entity';
import { AnswerRecord } from './answer-record.entity';

@Entity('questions')
export class Question extends BaseEntity {
  @Column({ name: 'subject_id', type: 'bigint', unsigned: true })
  subjectId: number;

  @Column({
    type: 'enum',
    enum: QuestionType,
  })
  type: QuestionType;

  @Column({ type: 'tinyint', default: 2 })
  difficulty: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  options?: any;

  @Column({ type: 'text' })
  answer: string;

  @Column({ type: 'text', nullable: true })
  analysis?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10.0 })
  score: number;

  @Column({ name: 'estimated_time', type: 'int', nullable: true })
  estimatedTime?: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source?: string;

  @Column({
    name: 'creator_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  creatorId?: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @Column({
    name: 'correct_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  correctRate?: number;

  @ManyToOne(() => Subject, (subject) => subject.questions)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @OneToMany(() => QuestionKnowledge, (qk) => qk.question)
  questionKnowledges: QuestionKnowledge[];

  @OneToMany(() => ExerciseQuestion, (eq) => eq.question)
  exerciseQuestions: ExerciseQuestion[];

  @OneToMany(() => AnswerRecord, (ar) => ar.question)
  answerRecords: AnswerRecord[];
}
