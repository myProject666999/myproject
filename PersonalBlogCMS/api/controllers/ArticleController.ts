import type { Request, Response } from 'express';
import { ArticleService } from '../services/ArticleService';
import { success, error, notFound } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import type {
  ArticleListQuery,
  CreateArticleRequest,
  UpdateArticleRequest,
} from '../../shared/types';

export class ArticleController {
  private articleService: ArticleService;

  constructor() {
    this.articleService = new ArticleService();
  }

  async getPublishedArticles(req: Request, res: Response): Promise<void> {
    try {
      const query: ArticleListQuery = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        tagId: req.query.tagId ? parseInt(req.query.tagId as string) : undefined,
      };

      const result = await this.articleService.getPublishedArticles(query);
      success(res, result);
    } catch (err) {
      error(res, '获取文章列表失败', 500, 500);
    }
  }

  async getAllArticles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const query: ArticleListQuery = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        status: req.query.status as any,
        keyword: req.query.keyword as string,
      };

      const result = await this.articleService.getAllArticles(query);
      success(res, result);
    } catch (err) {
      error(res, '获取文章列表失败', 500, 500);
    }
  }

  async getArticleDetail(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        error(res, '无效的文章ID');
        return;
      }

      const result = await this.articleService.getArticleDetail(id);
      if (!result.article) {
        notFound(res, '文章不存在');
        return;
      }

      const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '';
      const userAgent = req.headers['user-agent'] || '';
      const referer = req.headers['referer'];

      await this.articleService.incrementViewCount(id, ip, userAgent, referer);

      success(res, result);
    } catch (err) {
      error(res, '获取文章详情失败', 500, 500);
    }
  }

  async getHotArticles(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const articles = await this.articleService.getHotArticles(limit);
      success(res, articles);
    } catch (err) {
      error(res, '获取热门文章失败', 500, 500);
    }
  }

  async searchArticles(req: Request, res: Response): Promise<void> {
    try {
      const keyword = req.query.keyword as string;
      if (!keyword || keyword.trim() === '') {
        error(res, '搜索关键词不能为空');
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const result = await this.articleService.search(keyword.trim(), page, pageSize);
      success(res, result);
    } catch (err) {
      error(res, '搜索失败', 500, 500);
    }
  }

  async getArchive(req: Request, res: Response): Promise<void> {
    try {
      const archive = await this.articleService.getArchive();
      success(res, archive);
    } catch (err) {
      error(res, '获取归档失败', 500, 500);
    }
  }

  async createArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        error(res, '未授权', 401, 401);
        return;
      }

      const body = req.body as CreateArticleRequest;
      if (!body.title || body.title.trim() === '') {
        error(res, '文章标题不能为空');
        return;
      }

      const article = await this.articleService.createArticle(body, userId);
      success(res, article, '文章创建成功');
    } catch (err) {
      error(res, '创建文章失败', 500, 500);
    }
  }

  async updateArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        error(res, '无效的文章ID');
        return;
      }

      const body = req.body as UpdateArticleRequest;
      body.id = id;

      const article = await this.articleService.updateArticle(body);
      if (!article) {
        notFound(res, '文章不存在');
        return;
      }

      success(res, article, '文章更新成功');
    } catch (err) {
      error(res, '更新文章失败', 500, 500);
    }
  }

  async deleteArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        error(res, '无效的文章ID');
        return;
      }

      const success = await this.articleService.deleteArticle(id);
      if (success) {
        success(res, null, '文章删除成功');
      } else {
        notFound(res, '文章不存在');
      }
    } catch (err) {
      error(res, '删除文章失败', 500, 500);
    }
  }
}
