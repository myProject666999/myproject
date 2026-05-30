import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { KnowledgePoint } from './knowledge-point.entity';
import { Question } from './question.entity';
import { Exercise } from './exercise.entity';

@Entity('subjects')
export class Subject extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @OneToMany(() => KnowledgePoint, (kp) => kp.subject)
  knowledgePoints: KnowledgePoint[];

  @OneToMany(() => Question, (q) => q.subject)
  questions: Question[];

  @OneToMany(() => Exercise, (e) => e.subject)
  exercises: Exercise[];
}
