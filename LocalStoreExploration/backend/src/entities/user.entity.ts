import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Note } from './note.entity';
import { Comment } from './comment.entity';
import { Favorite } from './favorite.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 50 })
  nickname: string;

  @Column({ nullable: true, length: 255 })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'followers_count', default: 0 })
  followersCount: number;

  @Column({ name: 'notes_count', default: 0 })
  notesCount: number;

  @Column({ name: 'is_verified', default: 0 })
  isVerified: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Note, note => note.user)
  notes: Note[];

  @OneToMany(() => Comment, comment => comment.user)
  comments: Comment[];

  @OneToMany(() => Favorite, favorite => favorite.user)
  favorites: Favorite[];
}
