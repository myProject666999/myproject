import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { DocumentsService } from '../documents/documents.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private documentsService: DocumentsService,
  ) {}

  async createComment(
    documentId: number,
    userId: number,
    data: { content: string; parent_id?: number; mentions?: number[] },
  ): Promise<Comment> {
    const doc = await this.documentsService.getDocumentById(documentId);
    if (!doc) {
      throw new NotFoundException('文档不存在');
    }

    const comment = this.commentRepository.create({
      document_id: documentId,
      user_id: userId,
      content: data.content,
      parent_id: data.parent_id || null,
      mentions: data.mentions || null,
    });

    return this.commentRepository.save(comment);
  }

  async getDocumentComments(documentId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { document_id: documentId },
      order: { created_at: 'ASC' },
      relations: ['user'],
    });
  }

  async updateComment(
    commentId: number,
    userId: number,
    content: string,
  ): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('只能修改自己的评论');
    }

    comment.content = content;
    return this.commentRepository.save(comment);
  }

  async deleteComment(commentId: number, userId: number): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('只能删除自己的评论');
    }

    await this.commentRepository.delete(commentId);
  }

  async resolveComment(commentId: number, userId: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    comment.is_resolved = 1;
    comment.resolved_at = new Date();
    comment.resolved_by = userId;
    return this.commentRepository.save(comment);
  }

  async unresolveComment(commentId: number, _userId: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    comment.is_resolved = 0;
    comment.resolved_at = null;
    comment.resolved_by = null;
    return this.commentRepository.save(comment);
  }
}
