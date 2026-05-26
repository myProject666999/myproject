export interface User {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
  createdAt: Date;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  articleCount: number;
  createdAt: Date;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
  articleCount: number;
  createdAt: Date;
}

export type ArticleStatus = 'draft' | 'published';

export interface Article {
  id: number;
  title: string;
  summary: string;
  contentMd: string;
  contentHtml: string;
  coverImage?: string;
  categoryId?: number;
  category?: Category;
  tags: Tag[];
  status: ArticleStatus;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface Comment {
  id: number;
  articleId: number;
  parentId?: number;
  authorName: string;
  authorEmail?: string;
  content: string;
  status: CommentStatus;
  createdAt: Date;
  replies?: Comment[];
}

export interface ArticleListQuery {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  tagId?: number;
  status?: ArticleStatus;
  keyword?: string;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StatsOverview {
  totalArticles: number;
  totalComments: number;
  totalViews: number;
  todayViews: number;
  pendingComments: number;
}

export interface VisitTrendItem {
  date: string;
  count: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface CreateArticleRequest {
  title: string;
  summary: string;
  contentMd: string;
  coverImage?: string;
  categoryId?: number;
  tagIds: number[];
  status: ArticleStatus;
}

export interface UpdateArticleRequest extends Partial<CreateArticleRequest> {
  id: number;
}

export interface CreateCommentRequest {
  authorName: string;
  authorEmail?: string;
  content: string;
  parentId?: number;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface CreateTagRequest {
  name: string;
  slug: string;
  color?: string;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}
