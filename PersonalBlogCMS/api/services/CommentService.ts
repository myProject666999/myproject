import { CommentRepository } from '../repositories/CommentRepository.js';
import { ArticleRepository } from '../repositories/ArticleRepository.js';
import { filterCommentContent } from '../utils/markdown.js';
import { redis, cacheKeys } from '../config/redis.js';
import { config } from '../config/index.js';
import type {
  Comment,
  CreateCommentRequest,
  CommentStatus,
  PaginatedResult,
} from '../../shared/types.js';

const sensitiveWords = ['广告', '推广', '赌博', '色情', '暴力', '反动'];

export class CommentService {
  private commentRepository: CommentRepository;
  private articleRepository: ArticleRepository;

  constructor() {
    this.commentRepository = new CommentRepository();
    this.articleRepository = new ArticleRepository();
  }

  async getApprovedComments(articleId: number): Promise<Comment[]> {
    return this.commentRepository.findApprovedByArticleId(articleId);
  }

  async getAllComments(
    status?: CommentStatus,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResult<Comment>> {
    return this.commentRepository.findAllAdmin(status, page, pageSize);
  }

  async createComment(
    articleId: number,
    request: CreateCommentRequest,
    ip: string
  ): Promise<Comment | { error: string }> {
    const rateLimitKey = cacheKeys.rateLimit(ip);
    const existing = await redis.get(rateLimitKey);
    if (existing) {
      return { error: '评论过于频繁，请稍后再试' };
    }

    const article = await this.articleRepository.findById(articleId);
    if (!article || article.status !== 'published') {
      return { error: '文章不存在' };
    }

    const filteredContent = filterCommentContent(request.content);

    const hasSensitiveWord = sensitiveWords.some((word) =>
      filteredContent.toLowerCase().includes(word.toLowerCase())
    );

    if (hasSensitiveWord) {
      return { error: '评论内容包含敏感词' };
    }

    if (request.parentId) {
      const parent = await this.commentRepository.findById(request.parentId);
      if (!parent || parent.articleId !== articleId) {
        return { error: '回复的评论不存在' };
      }
    }

    const comment = await this.commentRepository.create({
      articleId,
      parentId: request.parentId,
      authorName: request.authorName,
      authorEmail: request.authorEmail,
      content: filteredContent,
      status: 'pending' as CommentStatus,
      ipAddress: ip,
    });

    await redis.set(rateLimitKey, '1', 'PX', config.rateLimit.commentWindowMs);
    await redis.del(cacheKeys.statsOverview);

    return comment;
  }

  async approveComment(id: number): Promise<Comment | null> {
    const comment = await this.commentRepository.updateStatus(id, 'approved');
    if (comment) {
      await redis.del(cacheKeys.statsOverview);
    }
    return comment;
  }

  async rejectComment(id: number): Promise<Comment | null> {
    const comment = await this.commentRepository.updateStatus(id, 'rejected');
    if (comment) {
      await redis.del(cacheKeys.statsOverview);
    }
    return comment;
  }

  async replyComment(id: number, content: string): Promise<Comment | null> {
    const parent = await this.commentRepository.findById(id);
    if (!parent) return null;

    const filteredContent = filterCommentContent(content);

    const reply = await this.commentRepository.create({
      articleId: parent.articleId,
      parentId: id,
      authorName: '博主',
      content: filteredContent,
      status: 'approved' as CommentStatus,
    });

    await redis.del(cacheKeys.statsOverview);
    return reply;
  }

  async deleteComment(id: number): Promise<boolean> {
    const success = await this.commentRepository.delete(id);
    if (success) {
      await redis.del(cacheKeys.statsOverview);
    }
    return success;
  }
}
