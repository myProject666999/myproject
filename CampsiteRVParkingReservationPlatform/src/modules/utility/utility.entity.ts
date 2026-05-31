import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Campsite } from '../campsite/campsite.entity';
import { Spot } from '../spot/spot.entity';
import { Reservation } from '../reservation/reservation.entity';

export enum UtilityPoleType {
  ELECTRIC = 'electric',
  WATER = 'water',
  BOTH = 'both',
}

export enum UtilityUsageStatus {
  ACTIVE = 'active',
  SETTLED = 'settled',
}

@Entity('utility_poles')
export class UtilityPole {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'campsite_id', type: 'bigint' })
  campsiteId: number;

  @Column({ name: 'spot_id', type: 'bigint', nullable: true })
  spotId: number;

  @Column({ name: 'pole_no', length: 50 })
  poleNo: string;

  @Column({
    type: 'enum',
    enum: UtilityPoleType,
    default: UtilityPoleType.BOTH,
  })
  type: UtilityPoleType;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ name: 'initial_electric_reading', type: 'decimal', precision: 10, scale: 2, default: 0 })
  initialElectricReading: number;

  @Column({ name: 'initial_water_reading', type: 'decimal', precision: 10, scale: 2, default: 0 })
  initialWaterReading: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Campsite, campsite => campsite.utilityPoles)
  @JoinColumn({ name: 'campsite_id' })
  campsite: Campsite;

  @ManyToOne(() => Spot, spot => spot.utilityPoles)
  @JoinColumn({ name: 'spot_id' })
  spot: Spot;
}

@Entity('utility_usage')
export class UtilityUsage {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'reservation_id', type: 'bigint' })
  reservationId: number;

  @Column({ name: 'pole_id', type: 'bigint' })
  poleId: number;

  @Column({ name: 'start_electric_reading', type: 'decimal', precision: 10, scale: 2 })
  startElectricReading: number;

  @Column({ name: 'end_electric_reading', type: 'decimal', precision: 10, scale: 2, nullable: true })
  endElectricReading: number;

  @Column({ name: 'electric_usage', type: 'decimal', precision: 10, scale: 2, nullable: true })
  electricUsage: number;

  @Column({ name: 'start_water_reading', type: 'decimal', precision: 10, scale: 2 })
  startWaterReading: number;

  @Column({ name: 'end_water_reading', type: 'decimal', precision: 10, scale: 2, nullable: true })
  endWaterReading: number;

  @Column({ name: 'water_usage', type: 'decimal', precision: 10, scale: 2, nullable: true })
  waterUsage: number;

  @Column({ name: 'electric_price', type: 'decimal', precision: 8, scale: 4, nullable: true })
  electricPrice: number;

  @Column({ name: 'water_price', type: 'decimal', precision: 8, scale: 4, nullable: true })
  waterPrice: number;

  @Column({ name: 'electric_fee', type: 'decimal', precision: 10, scale: 2, nullable: true })
  electricFee: number;

  @Column({ name: 'water_fee', type: 'decimal', precision: 10, scale: 2, nullable: true })
  waterFee: number;

  @Column({ name: 'total_fee', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalFee: number;

  @Column({
    type: 'enum',
    enum: UtilityUsageStatus,
    default: UtilityUsageStatus.ACTIVE,
  })
  status: UtilityUsageStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Reservation, reservation => reservation.utilityUsages)
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @ManyToOne(() => UtilityPole)
  @JoinColumn({ name: 'pole_id' })
  pole: UtilityPole;
}
