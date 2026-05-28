import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Note } from './note.entity';

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  address: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ nullable: true, length: 50 })
  category: string;

  @Column({ name: 'cover_image', nullable: true, length: 255 })
  coverImage: string;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  rating: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lat: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lng: number;

  @Column({ name: 'business_hours', nullable: true, length: 255 })
  businessHours: string;

  @Column({ name: 'notes_count', default: 0 })
  notesCount: number;

  @Column({ name: 'average_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
  averageCost: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Note, note => note.shop)
  notes: Note[];
}
