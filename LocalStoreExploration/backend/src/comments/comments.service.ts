import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async findByNoteId(noteId: number, page: number = 1, limit: number = 20) {
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { noteId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { list: comments, total, page, limit };
  }

  async create(userId: number, noteId: number, content: string) {
    const comment = this.commentRepository.create({
      userId,
      noteId,
      content,
    });
    return this.commentRepository.save(comment);
  }
}
