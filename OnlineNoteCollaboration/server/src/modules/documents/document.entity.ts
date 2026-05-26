import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Space } from '../spaces/space.entity';
import { User } from '../users/user.entity';
import { Comment } from '../comments/comment.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true })
  space_id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  parent_id: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'longtext', nullable: true })
  content: string;

  @Column({ type: 'varchar', length: 20, default: 'rich' })
  content_type: string;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'bigint', unsigned: true })
  created_by: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  updated_by: number;

  @Column({ type: 'tinyint', default: 0 })
  is_deleted: number;

  @Column({ type: 'datetime', nullable: true })
  deleted_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date;

  @ManyToOne(() => Space, (space) => space.documents)
  @JoinColumn({ name: 'space_id' })
  space: Space;

  @ManyToOne(() => User, (user) => user.documents)
  @JoinColumn({ name: 'created_by' })
  created_by_user: User;

  @OneToMany(() => Comment, (comment) => comment.document)
  comments: Comment[];
}
