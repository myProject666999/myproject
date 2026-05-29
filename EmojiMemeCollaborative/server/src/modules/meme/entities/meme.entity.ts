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
import { Template } from '../../template/entities/template.entity';

@Entity('memes')
export class Meme {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ name: 'image_url', length: 500, nullable: true })
  image_url: string;

  @Column({ name: 'template_id', type: 'int', nullable: true })
  template_id: number | null;

  @ManyToOne(() => Template)
  @JoinColumn({ name: 'template_id' })
  template: Template;

  @Column({ name: 'canvas_data', type: 'json', nullable: true })
  canvas_data: {
    textLayers: Array<{
      id: string;
      text: string;
      x: number;
      y: number;
      fontSize: number;
      fontFamily: string;
      color: string;
      rotation: number;
    }>;
    stickerLayers: Array<{
      id: string;
      stickerId: number;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
    }>;
    backgroundColor: string;
    width: number;
    height: number;
  };

  @Column({ name: 'created_by' })
  created_by: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ type: 'enum', enum: ['approved', 'pending', 'rejected'], default: 'pending' })
  status: 'approved' | 'pending' | 'rejected';

  @Column({ name: 'view_count', default: 0 })
  view_count: number;

  @Column({ name: 'like_count', default: 0 })
  like_count: number;

  @Column({ name: 'favorite_count', default: 0 })
  favorite_count: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
