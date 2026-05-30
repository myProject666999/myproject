import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { Subject } from './subject.entity';
import { QuestionKnowledge } from './question-knowledge.entity';

@Entity('knowledge_points')
export class KnowledgePoint extends BaseEntity {
  @Column({ name: 'subject_id', type: 'bigint', unsigned: true })
  subjectId: number;

  @Column({ name: 'parent_id', type: 'bigint', unsigned: true, nullable: true })
  parentId?: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'difficulty_level', type: 'tinyint', default: 1 })
  difficultyLevel: number;

  @Column({ name: 'importance_level', type: 'tinyint', default: 1 })
  importanceLevel: number;

  @Column({ type: 'int', default: 1 })
  depth: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  path?: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @ManyToOne(() => Subject, (subject) => subject.knowledgePoints)
  subject: Subject;

  @ManyToOne(() => KnowledgePoint, (kp) => kp.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: KnowledgePoint;

  @OneToMany(() => KnowledgePoint, (kp) => kp.parent)
  children: KnowledgePoint[];

  @OneToMany(() => QuestionKnowledge, (qk) => qk.knowledgePoint)
  questionKnowledges: QuestionKnowledge[];
}
