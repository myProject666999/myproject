import api from './index';
import type { StatsOverview, VisitTrendItem } from '../../shared/types';

export const statsApi = {
  getOverview: () =>
    api.get<never, StatsOverview>('/stats/overview'),

  getVisitTrend: (days = 7) =>
    api.get<never, VisitTrendItem[]>('/stats/trend', { params: { days } }),

  getPopularArticles: (limit = 5) =>
    api.get<never, { id: number; title: string; viewCount: number }[]>('/stats/popular', { params: { limit } }),

  getCategoryStats: () =>
    api.get<never, { name: string; value: number }[]>('/stats/categories'),
};
