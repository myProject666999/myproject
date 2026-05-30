import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/entities/base.entity';
import { KnowledgePoint } from './knowledge-point.entity';
import { KnowledgeRelationType } from '../common/types';

@Entity('knowledge_relations')
export class KnowledgeRelation extends BaseEntity {
  @Column({ name: 'from_kp_id', type: 'bigint', unsigned: true })
  fromKpId: number;

  @Column({ name: 'to_kp_id', type: 'bigint', unsigned: true })
  toKpId: number;

  @Column({
    name: 'relation_type',
    type: 'enum',
    enum: KnowledgeRelationType,
    default: KnowledgeRelationType.RELATED,
  })
  relationType: KnowledgeRelationType;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  weight: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @ManyToOne(() => KnowledgePoint)
  @JoinColumn({ name: 'from_kp_id' })
  fromKp: KnowledgePoint;

  @ManyToOne(() => KnowledgePoint)
  @JoinColumn({ name: 'to_kp_id' })
  toKp: KnowledgePoint;
}
