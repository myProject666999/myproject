import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('services')
export class Service extends BaseEntity {
  @Column({ length: 100, comment: '服务名称' })
  name: string;

  @Column({ length: 50, comment: '服务分类: bath/spa/trimming/dyeing' })
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '基础价格' })
  price: number;

  @Column({ type: 'int', default: 60, comment: '服务时长(分钟)' })
  duration: number;

  @Column({ type: 'text', nullable: true, comment: '服务描述' })
  description: string;

  @Column({ type: 'text', nullable: true, comment: '适用犬种(可选,空表示全部)' })
  applicableBreeds: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'min_weight', comment: '最小体重' })
  minWeight: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'max_weight', comment: '最大体重' })
  maxWeight: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;
}
