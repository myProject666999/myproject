import { request } from './request';
import type {
  DailyStat,
  TrendData,
  WeightTrendData,
  GetDailyStatsParams,
  GetTrendStatsParams,
} from '../types';

export const getDailyStats = (params: GetDailyStatsParams) => {
  return request<DailyStat>({
    url: '/stats/daily',
    method: 'GET',
    params,
  });
};

export const getTrendStats = (params?: GetTrendStatsParams) => {
  return request<{
    calorieTrend: TrendData[];
    weightTrend: WeightTrendData[];
  }>({
    url: '/stats/trend',
    method: 'GET',
    params,
  });
};
