import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('templates')
export class Template {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'image_url', length: 500 })
  image_url: string;

  @Column({ length: 50, nullable: true })
  category: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column({ type: 'int', default: 0 })
  width: number;

  @Column({ type: 'int', default: 0 })
  height: number;

  @Column({ name: 'is_official', default: false })
  is_official: boolean;

  @Column({ name: 'copyright_info', length: 500, nullable: true })
  copyright_info: string;

  @Column({ name: 'created_by', nullable: true })
  created_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ type: 'enum', enum: ['approved', 'pending', 'rejected'], default: 'pending' })
  status: 'approved' | 'pending' | 'rejected';

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
