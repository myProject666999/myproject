import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AdSchedule } from './ad-schedule.entity';
import { AdSpace } from './ad-space.entity';
import { AdMaterial } from './ad-material.entity';

@Entity('ad_stats')
export class AdStat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'schedule_id' })
  scheduleId: number;

  @Column({ name: 'ad_space_id' })
  adSpaceId: number;

  @Column({ name: 'material_id' })
  materialId: number;

  @Column({ name: 'stat_date', type: 'date' })
  statDate: Date;

  @Column({ default: 0 })
  impressions: number;

  @Column({ default: 0 })
  clicks: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  ctr: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => AdSchedule)
  @JoinColumn({ name: 'schedule_id' })
  schedule: AdSchedule;

  @ManyToOne(() => AdSpace)
  @JoinColumn({ name: 'ad_space_id' })
  adSpace: AdSpace;

  @ManyToOne(() => AdMaterial)
  @JoinColumn({ name: 'material_id' })
  material: AdMaterial;
}
