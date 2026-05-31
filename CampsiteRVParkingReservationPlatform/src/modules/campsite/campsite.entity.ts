import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Spot } from '../spot/spot.entity';
import { Reservation } from '../reservation/reservation.entity';
import { Review } from '../review/review.entity';
import { RentalItem } from '../rental/rental.entity';
import { UtilityPole } from '../utility/utility.entity';

@Entity('campsites')
export class Campsite {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'owner_id', type: 'bigint' })
  ownerId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 50, nullable: true })
  province: string;

  @Column({ length: 50, nullable: true })
  city: string;

  @Column({ length: 50, nullable: true })
  district: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ name: 'cover_image', length: 255, nullable: true })
  coverImage: string;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ type: 'json', nullable: true })
  facilities: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ name: 'review_count', type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'tinyint', default: 0 })
  status: number;

  @Column({ name: 'open_time', type: 'time', nullable: true })
  openTime: string;

  @Column({ name: 'close_time', type: 'time', nullable: true })
  closeTime: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.campsites)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Spot, spot => spot.campsite)
  spots: Spot[];

  @OneToMany(() => Reservation, reservation => reservation.campsite)
  reservations: Reservation[];

  @OneToMany(() => Review, review => review.campsite)
  reviews: Review[];

  @OneToMany(() => RentalItem, rentalItem => rentalItem.campsite)
  rentalItems: RentalItem[];

  @OneToMany(() => UtilityPole, utilityPole => utilityPole.campsite)
  utilityPoles: UtilityPole[];
}
