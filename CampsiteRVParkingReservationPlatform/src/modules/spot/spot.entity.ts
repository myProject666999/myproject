import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Campsite } from '../campsite/campsite.entity';
import { Reservation } from '../reservation/reservation.entity';
import { UtilityPole } from '../utility/utility.entity';

@Entity('spot_types')
export class SpotType {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Spot, spot => spot.type)
  spots: Spot[];
}

@Entity('spots')
export class Spot {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'campsite_id', type: 'bigint' })
  campsiteId: number;

  @Column({ name: 'type_id', type: 'bigint' })
  typeId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  area: number;

  @Column({ name: 'max_occupancy', type: 'int', nullable: true })
  maxOccupancy: number;

  @Column({ name: 'max_vehicle_length', type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxVehicleLength: number;

  @Column({ name: 'has_electricity', type: 'tinyint', default: 0 })
  hasElectricity: number;

  @Column({ name: 'has_water', type: 'tinyint', default: 0 })
  hasWater: number;

  @Column({ name: 'has_sewage', type: 'tinyint', default: 0 })
  hasSewage: number;

  @Column({ name: 'price_per_day', type: 'decimal', precision: 10, scale: 2 })
  pricePerDay: number;

  @Column({ name: 'weekend_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  weekendPrice: number;

  @Column({ name: 'holiday_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  holidayPrice: number;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Campsite, campsite => campsite.spots)
  @JoinColumn({ name: 'campsite_id' })
  campsite: Campsite;

  @ManyToOne(() => SpotType, spotType => spotType.spots)
  @JoinColumn({ name: 'type_id' })
  type: SpotType;

  @OneToMany(() => Reservation, reservation => reservation.spot)
  reservations: Reservation[];

  @OneToMany(() => UtilityPole, utilityPole => utilityPole.spot)
  utilityPoles: UtilityPole[];
}
