import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Note } from './note.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'note_id' })
  noteId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'likes_count', default: 0 })
  likesCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Note, note => note.comments)
  @JoinColumn({ name: 'note_id' })
  note: Note;
}
