import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Shop } from './shop.entity';
import { Comment } from './comment.entity';

export type NoteStatus = 'pending' | 'approved' | 'rejected';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'shop_id' })
  shopId: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json' })
  images: string[];

  @Column({ name: 'rating_overall', type: 'decimal', precision: 3, scale: 1 })
  ratingOverall: number;

  @Column({ name: 'rating_taste', type: 'decimal', precision: 3, scale: 1, nullable: true })
  ratingTaste: number;

  @Column({ name: 'rating_env', type: 'decimal', precision: 3, scale: 1, nullable: true })
  ratingEnv: number;

  @Column({ name: 'rating_service', type: 'decimal', precision: 3, scale: 1, nullable: true })
  ratingService: number;

  @Column({ name: 'rating_cost', type: 'decimal', precision: 3, scale: 1, nullable: true })
  ratingCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lng: number;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 50 })
  category: string;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status: NoteStatus;

  @Column({ name: 'views_count', default: 0 })
  viewsCount: number;

  @Column({ name: 'likes_count', default: 0 })
  likesCount: number;

  @Column({ name: 'comments_count', default: 0 })
  commentsCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.notes)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Shop, shop => shop.notes)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @OneToMany(() => Comment, comment => comment.note)
  comments: Comment[];
}
