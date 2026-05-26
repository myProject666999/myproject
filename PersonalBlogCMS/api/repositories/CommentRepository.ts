import { BaseRepository } from './BaseRepository.js';
import { db } from '../config/database.js';
import type { Comment, CommentStatus, PaginatedResult } from '../../shared/types.js';

interface CommentRow {
  id: number;
  article_id: number;
  parent_id?: number | null;
  author_name: string;
  author_email?: string | null;
  content: string;
  status: CommentStatus;
  ip_address?: string | null;
  created_at: string;
  updated_at?: string | null;
  article_title?: string | null;
}

export class CommentRepository extends BaseRepository<Comment> {
  constructor() {
    super('comments');
  }

  protected rowToEntity(row: Record<string, unknown>): Comment {
    const r = row as CommentRow;
    const comment: Comment = {
      id: r.id,
      articleId: r.article_id,
      parentId: r.parent_id ?? undefined,
      authorName: r.author_name,
      authorEmail: r.author_email ?? undefined,
      content: r.content,
      status: r.status,
      createdAt: new Date(r.created_at),
    };

    const anyRow = row as Record<string, unknown>;
    if (anyRow.updated_at !== undefined && anyRow.updated_at !== null) {
      (comment as Comment & { updatedAt: Date }).updatedAt = new Date(anyRow.updated_at as string);
    }
    if (anyRow.ip_address !== undefined && anyRow.ip_address !== null) {
      (comment as Comment & { ipAddress: string }).ipAddress = anyRow.ip_address as string;
    }

    return comment;
  }

  async findApprovedByArticleId(articleId: number): Promise<Comment[]> {
    const topRows = db
      .prepare(
        `SELECT * FROM comments WHERE article_id = ? AND status = 'approved' AND parent_id IS NULL ORDER BY created_at DESC`
      )
      .all(articleId) as CommentRow[];

    const getReplies = db.prepare(
      `SELECT * FROM comments WHERE parent_id = ? AND status = 'approved' ORDER BY created_at ASC`
    );

    const comments: Comment[] = [];
    for (const topRow of topRows) {
      const topComment = this.rowToEntity(topRow as unknown as Record<string, unknown>);
      const replyRows = getReplies.all(topRow.id) as CommentRow[];
      topComment.replies = replyRows.map((rr) =>
        this.rowToEntity(rr as unknown as Record<string, unknown>)
      );
      comments.push(topComment);
    }

    return comments;
  }

  async findAllAdmin(
    status?: CommentStatus,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResult<Comment & { articleTitle?: string }>> {
    const whereClause = status ? `WHERE c.status = ?` : '';
    const params: unknown[] = [];
    if (status) params.push(status);

    const countSql = `SELECT COUNT(*) as cnt FROM comments c ${whereClause}`;
    const countRow = db.prepare(countSql).get(...params) as { cnt: number };
    const total = countRow?.cnt || 0;

    const sql = `SELECT c.*, a.title AS article_title FROM comments c LEFT JOIN articles a ON a.id = c.article_id ${whereClause} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    const rows = db
      .prepare(sql)
      .all(...params, pageSize, (page - 1) * pageSize) as (CommentRow & { article_title?: string | null })[];

    const list = rows.map((row) => {
      const comment = this.rowToEntity(row as unknown as Record<string, unknown>) as Comment & {
        articleTitle?: string;
      };
      if (row.article_title !== undefined && row.article_title !== null) {
        comment.articleTitle = row.article_title;
      }
      return comment;
    });

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateStatus(id: number, status: CommentStatus): Promise<Comment | null> {
    db.prepare(`UPDATE comments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(
      status,
      id
    );
    return this.findById(id);
  }
}
