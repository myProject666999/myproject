import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { ClassEntity } from './class.entity';
import { Subject } from './subject.entity';
import { KnowledgePoint } from './knowledge-point.entity';

@Entity('class_statistics')
export class ClassStatistics extends BaseEntity {
  @Column({ name: 'class_id', type: 'bigint', unsigned: true })
  classId: number;

  @Column({ name: 'subject_id', type: 'bigint', unsigned: true })
  subjectId: number;

  @Column({
    name: 'knowledge_point_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  knowledgePointId?: number;

  @Column({ name: 'stat_date', type: 'date' })
  statDate: Date;

  @Column({
    name: 'avg_mastery',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  avgMastery?: number;

  @Column({
    name: 'max_mastery',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  maxMastery?: number;

  @Column({
    name: 'min_mastery',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  minMastery?: number;

  @Column({ name: 'mastery_distribution', type: 'json', nullable: true })
  masteryDistribution?: any;

  @Column({ name: 'total_questions', type: 'int', default: 0 })
  totalQuestions: number;

  @Column({
    name: 'avg_score',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  avgScore?: number;

  @Column({
    name: 'correct_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  correctRate?: number;

  @Column({ name: 'student_count', type: 'int', default: 0 })
  studentCount: number;

  @Column({ name: 'weak_point_count', type: 'int', default: 0 })
  weakPointCount: number;

  @ManyToOne(() => ClassEntity)
  class: ClassEntity;

  @ManyToOne(() => Subject)
  subject: Subject;

  @ManyToOne(() => KnowledgePoint)
  knowledgePoint?: KnowledgePoint;
}
