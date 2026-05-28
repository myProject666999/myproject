import type { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService.js';
import { success, error, notFound } from '../utils/response.js';
import type { AuthRequest } from '../middleware/auth.js';
import type { CreateCategoryRequest, CreateTagRequest } from '../../shared/types.js';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this.categoryService.getAllCategories();
      success(res, categories);
    } catch (err) {
      error(res, '获取分类失败', 500, 500);
    }
  }

  async getTags(req: Request, res: Response): Promise<void> {
    try {
      const tags = await this.categoryService.getAllTags();
      success(res, tags);
    } catch (err) {
      error(res, '获取标签失败', 500, 500);
    }
  }

  async createCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const body = req.body as CreateCategoryRequest;
      if (!body.name || !body.slug) {
        error(res, '分类名称和slug不能为空');
        return;
      }

      const result = await this.categoryService.createCategory(body);

      if ('error' in result) {
        error(res, result.error);
        return;
      }

      success(res, result, '分类创建成功');
    } catch (err) {
      console.error('创建分类失败:', err);
      error(res, '创建分类失败', 500, 500);
    }
  }

  async updateCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        error(res, '无效的分类ID');
        return;
      }

      const body = req.body as Partial<CreateCategoryRequest>;
      const category = await this.categoryService.updateCategory(id, body);
      if (!category) {
        notFound(res, '分类不存在');
        return;
      }

      success(res, category, '分类更新成功');
    } catch (err) {
      error(res, '更新分类失败', 500, 500);
    }
  }

  async deleteCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        error(res, '无效的分类ID');
        return;
      }

      const success = await this.categoryService.deleteCategory(id);
      if (success) {
        success(res, null, '分类删除成功');
      } else {
        notFound(res, '分类不存在');
      }
    } catch (err) {
      error(res, '删除分类失败', 500, 500);
    }
  }

  async createTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const body = req.body as CreateTagRequest;
      if (!body.name || !body.slug) {
        error(res, '标签名称和slug不能为空');
        return;
      }

      const result = await this.categoryService.createTag(body);

      if ('error' in result) {
        error(res, result.error);
        return;
      }

      success(res, result, '标签创建成功');
    } catch (err) {
      console.error('创建标签失败:', err);
      error(res, '创建标签失败', 500, 500);
    }
  }

  async updateTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        error(res, '无效的标签ID');
        return;
      }

      const body = req.body as Partial<CreateTagRequest>;
      const tag = await this.categoryService.updateTag(id, body);
      if (!tag) {
        notFound(res, '标签不存在');
        return;
      }

      success(res, tag, '标签更新成功');
    } catch (err) {
      error(res, '更新标签失败', 500, 500);
    }
  }

  async deleteTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        error(res, '无效的标签ID');
        return;
      }

      const success = await this.categoryService.deleteTag(id);
      if (success) {
        success(res, null, '标签删除成功');
      } else {
        notFound(res, '标签不存在');
      }
    } catch (err) {
      error(res, '删除标签失败', 500, 500);
    }
  }
}
