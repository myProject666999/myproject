import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Campsite } from '../campsite/campsite.entity';
import { Reservation } from '../reservation/reservation.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'campsite_id', type: 'bigint' })
  campsiteId: number;

  @Column({ name: 'reservation_id', type: 'bigint' })
  reservationId: number;

  @Column({ type: 'tinyint' })
  rating: number;

  @Column({ name: 'location_rating', type: 'tinyint', nullable: true })
  locationRating: number;

  @Column({ name: 'facility_rating', type: 'tinyint', nullable: true })
  facilityRating: number;

  @Column({ name: 'service_rating', type: 'tinyint', nullable: true })
  serviceRating: number;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ name: 'is_guide', type: 'tinyint', default: 0 })
  isGuide: number;

  @Column({ name: 'guide_title', length: 200, nullable: true })
  guideTitle: string;

  @Column({ name: 'likes_count', type: 'int', default: 0 })
  likesCount: number;

  @Column({ name: 'comments_count', type: 'int', default: 0 })
  commentsCount: number;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @Column({ name: 'is_verified', type: 'tinyint', default: 0 })
  isVerified: number;

  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress: string;

  @Column({ name: 'device_id', length: 100, nullable: true })
  deviceId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.reviews)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Campsite, campsite => campsite.reviews)
  @JoinColumn({ name: 'campsite_id' })
  campsite: Campsite;

  @ManyToOne(() => Reservation, reservation => reservation.reviews)
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @OneToMany(() => ReviewComment, comment => comment.review)
  comments: ReviewComment[];
}

@Entity('review_comments')
export class ReviewComment {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'review_id', type: 'bigint' })
  reviewId: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'parent_id', type: 'bigint', nullable: true })
  parentId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Review, review => review.comments)
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ReviewComment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: ReviewComment;
}
