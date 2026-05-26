import { BaseRepository } from './BaseRepository.js';
import { Comment } from '../entities/Comment.js';
import type { CommentStatus } from '../../shared/types';

export class CommentRepository extends BaseRepository<Comment> {
  constructor() {
    super(Comment);
  }

  async findApprovedByArticleId(articleId: number): Promise<Comment[]> {
    const comments = await this.repository
      .createQueryBuilder('comment')
      .where('comment.article_id = :articleId', { articleId })
      .andWhere('comment.status = :status', { status: 'approved' })
      .andWhere('comment.parent_id IS NULL')
      .leftJoinAndSelect('comment.replies', 'replies', 'replies.status = :status', {
        status: 'approved',
      })
      .orderBy('comment.created_at', 'DESC')
      .addOrderBy('replies.created_at', 'ASC')
      .getMany();

    return comments;
  }

  async findAllAdmin(status?: CommentStatus, page = 1, pageSize = 20) {
    const qb = this.repository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.article', 'article');

    if (status) {
      qb.where('comment.status = :status', { status });
    }

    qb.orderBy('comment.created_at', 'DESC');

    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateStatus(id: number, status: CommentStatus): Promise<Comment | null> {
    const comment = await this.findById(id);
    if (!comment) return null;
    comment.status = status;
    return this.repository.save(comment);
  }
}
