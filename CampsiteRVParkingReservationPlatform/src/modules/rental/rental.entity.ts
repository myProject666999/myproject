import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Campsite } from '../campsite/campsite.entity';
import { Reservation } from '../reservation/reservation.entity';
import { User } from '../user/user.entity';

export enum RentalOrderStatus {
  PENDING = 'pending',
  RENTED = 'rented',
  RETURNED = 'returned',
  LOST = 'lost',
  DAMAGED = 'damaged',
  CANCELLED = 'cancelled',
}

@Entity('rental_categories')
export class RentalCategory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  icon: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('rental_items')
export class RentalItem {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'campsite_id', type: 'bigint' })
  campsiteId: number;

  @Column({ name: 'category_id', type: 'bigint' })
  categoryId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  image: string;

  @Column({ name: 'total_quantity', type: 'int' })
  totalQuantity: number;

  @Column({ name: 'available_quantity', type: 'int' })
  availableQuantity: number;

  @Column({ name: 'price_per_day', type: 'decimal', precision: 10, scale: 2 })
  pricePerDay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deposit: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Campsite, campsite => campsite.rentalItems)
  @JoinColumn({ name: 'campsite_id' })
  campsite: Campsite;
}

@Entity('rental_orders')
export class RentalOrder {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'order_no', length: 32, unique: true })
  orderNo: string;

  @Column({ name: 'reservation_id', type: 'bigint', nullable: true })
  reservationId: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'campsite_id', type: 'bigint' })
  campsiteId: number;

  @Column({ name: 'item_id', type: 'bigint' })
  itemId: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ type: 'int' })
  days: number;

  @Column({ name: 'rental_fee', type: 'decimal', precision: 10, scale: 2 })
  rentalFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deposit: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: RentalOrderStatus,
    default: RentalOrderStatus.PENDING,
  })
  status: RentalOrderStatus;

  @Column({ name: 'picked_up_at', type: 'timestamp', nullable: true })
  pickedUpAt: Date;

  @Column({ name: 'returned_at', type: 'timestamp', nullable: true })
  returnedAt: Date;

  @Column({ name: 'damage_fee', type: 'decimal', precision: 10, scale: 2, default: 0 })
  damageFee: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Reservation, reservation => reservation.rentalOrders)
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
