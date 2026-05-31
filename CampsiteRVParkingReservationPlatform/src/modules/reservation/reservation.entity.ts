import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Campsite } from '../campsite/campsite.entity';
import { Spot } from '../spot/spot.entity';
import { RentalOrder } from '../rental/rental.entity';
import { UtilityUsage } from '../utility/utility.entity';
import { CheckinRecord } from '../checkin/checkin.entity';
import { Review } from '../review/review.entity';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'reservation_no', length: 32, unique: true })
  reservationNo: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'campsite_id', type: 'bigint' })
  campsiteId: number;

  @Column({ name: 'spot_id', type: 'bigint' })
  spotId: number;

  @Column({ name: 'checkin_date', type: 'date' })
  checkinDate: Date;

  @Column({ name: 'checkout_date', type: 'date' })
  checkoutDate: Date;

  @Column({ type: 'int' })
  days: number;

  @Column({ name: 'guest_count', type: 'int', default: 1 })
  guestCount: number;

  @Column({ name: 'vehicle_info', type: 'json', nullable: true })
  vehicleInfo: any;

  @Column({ name: 'contact_name', length: 50 })
  contactName: string;

  @Column({ name: 'contact_phone', length: 20 })
  contactPhone: string;

  @Column({ name: 'base_amount', type: 'decimal', precision: 10, scale: 2 })
  baseAmount: number;

  @Column({ name: 'utility_deposit', type: 'decimal', precision: 10, scale: 2, default: 0 })
  utilityDeposit: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ name: 'cancel_reason', length: 255, nullable: true })
  cancelReason: string;

  @Column({ name: 'checkin_time', type: 'timestamp', nullable: true })
  checkinTime: Date;

  @Column({ name: 'checkout_time', type: 'timestamp', nullable: true })
  checkoutTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.reservations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Campsite, campsite => campsite.reservations)
  @JoinColumn({ name: 'campsite_id' })
  campsite: Campsite;

  @ManyToOne(() => Spot, spot => spot.reservations)
  @JoinColumn({ name: 'spot_id' })
  spot: Spot;

  @OneToMany(() => RentalOrder, rentalOrder => rentalOrder.reservation)
  rentalOrders: RentalOrder[];

  @OneToMany(() => UtilityUsage, utilityUsage => utilityUsage.reservation)
  utilityUsages: UtilityUsage[];

  @OneToMany(() => CheckinRecord, checkinRecord => checkinRecord.reservation)
  checkinRecords: CheckinRecord[];

  @OneToMany(() => Review, review => review.reservation)
  reviews: Review[];
}
