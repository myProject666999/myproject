import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Reservation } from '../reservation/reservation.entity';
import { User } from '../user/user.entity';

export enum CheckinMethod {
  CODE = 'code',
  QR = 'qr',
  MANUAL = 'manual',
}

@Entity('checkin_records')
export class CheckinRecord {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'reservation_id', type: 'bigint' })
  reservationId: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'checkin_code', length: 32, unique: true })
  checkinCode: string;

  @Column({ name: 'qr_code', length: 255, nullable: true })
  qrCode: string;

  @Column({
    name: 'checkin_method',
    type: 'enum',
    enum: CheckinMethod,
    nullable: true,
  })
  checkinMethod: CheckinMethod;

  @Column({ name: 'checked_by', type: 'bigint', nullable: true })
  checkedBy: number;

  @Column({ type: 'json', nullable: true })
  guests: any[];

  @Column({ name: 'vehicle_plate', length: 20, nullable: true })
  vehiclePlate: string;

  @Column({ length: 255, nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Reservation, reservation => reservation.checkinRecords)
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'checked_by' })
  checker: User;
}
