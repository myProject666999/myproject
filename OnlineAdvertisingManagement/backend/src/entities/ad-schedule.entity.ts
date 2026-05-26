import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AdSpace } from './ad-space.entity';
import { AdMaterial } from './ad-material.entity';

@Entity('ad_schedules')
export class AdSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'ad_space_id' })
  adSpaceId: number;

  @Column({ name: 'material_id' })
  materialId: number;

  @Column({ name: 'start_time', type: 'datetime' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime' })
  endTime: Date;

  @Column({ default: 0 })
  priority: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => AdSpace)
  @JoinColumn({ name: 'ad_space_id' })
  adSpace: AdSpace;

  @ManyToOne(() => AdMaterial)
  @JoinColumn({ name: 'material_id' })
  material: AdMaterial;
}
