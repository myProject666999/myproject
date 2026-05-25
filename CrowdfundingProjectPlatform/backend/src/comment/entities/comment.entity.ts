import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'project_id', type: 'bigint', unsigned: true })
  projectId: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({ name: 'parent_id', type: 'bigint', unsigned: true, nullable: true })
  parentId?: number;

  @Column({ type: 'tinyint', default: 0 })
  type: number;

  @Column({ length: 1000 })
  content: string;

  @Column({ name: 'is_answered', type: 'tinyint', default: 0 })
  isAnswered: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
