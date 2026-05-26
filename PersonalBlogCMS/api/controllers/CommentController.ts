import type { Request, Response } from 'express';
import { CommentService } from '../services/CommentService';
import { success, error, notFound } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import type { CreateCommentRequest, CommentStatus } from '../../shared/types';

export class CommentController {
  private commentService: CommentService;

  constructor() {
    this.commentService = new CommentService();
  }

  async getApprovedComments(req: Request, res: Response): Promise<void> {
    try {
      const articleId = parseInt(req.params.articleId, 10);
      if (isNaN(articleId)) {
        error(res, '无效的文章ID');
        return;
      }

      const comments = await this.commentService.getApprovedComments(articleId);
      success(res, comments);
    } catch (err) {
      error(res, '获取评论失败', 500, 500);
    }
  }

  async getAllComments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const status = req.query.status as CommentStatus;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      const result = await this.commentService.getAllComments(status, page, pageSize);
      success(res, result);
    } catch (err) {
      error(res, '获取评论失败', 500, 500);
    }
  }

  async createComment(req: Request, res: Response): Promise<void> {
    try {
      const articleId = parseInt(req.params.articleId, 10);
      if (isNaN(articleId)) {
        error(res, '无效的文章ID');
        return;
      }

      const body = req.body as CreateCommentRequest;
      if (!body.authorName || !body.content) {
        error(res, '昵称和评论内容不能为空');
        return;
      }

      if (body.content.length > 1000) {
        error(res, '评论内容不能超过1000字');
        return;
      }

      const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '';
      const result = await this.commentService.createComment(articleId, body, ip);

      if ('error' in result) {
        error(res, result.error);
        return;
      }

      success(res, result, '评论提交成功，等待审核');
    } catch (err) {
      error(res, '发表评论失败', 500, 500);
    }
  }

  async approveComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        error(res, '无效的评论ID');
        return;
      }

      const comment = await this.commentService.approveComment(id);
      if (!comment) {
        notFound(res, '评论不存在');
        return;
      }

      success(res, comment, '评论审核通过');
    } catch (err) {
      error(res, '审核失败', 500, 500);
    }
  }

  async rejectComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        error(res, '无效的评论ID');
        return;
      }

      const comment = await this.commentService.rejectComment(id);
      if (!comment) {
        notFound(res, '评论不存在');
        return;
      }

      success(res, comment, '评论已拒绝');
    } catch (err) {
      error(res, '操作失败', 500, 500);
    }
  }

  async replyComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        error(res, '无效的评论ID');
        return;
      }

      const { content } = req.body;
      if (!content || content.trim() === '') {
        error(res, '回复内容不能为空');
        return;
      }

      const reply = await this.commentService.replyComment(id, content);
      if (!reply) {
        notFound(res, '评论不存在');
        return;
      }

      success(res, reply, '回复成功');
    } catch (err) {
      error(res, '回复失败', 500, 500);
    }
  }

  async deleteComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        error(res, '无效的评论ID');
        return;
      }

      const success = await this.commentService.deleteComment(id);
      if (success) {
        success(res, null, '评论删除成功');
      } else {
        notFound(res, '评论不存在');
      }
    } catch (err) {
      error(res, '删除失败', 500, 500);
    }
  }
}
