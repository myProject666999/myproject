import { get, post, put, del } from './request';
import type { EsgIndicator, EsgIndicatorData, PageResult } from '@/types';

export function getAllIndicators() {
  return get<EsgIndicator[]>('/esg-indicator/list');
}

export function getIndicatorsByDimension(dimension: number) {
  return get<EsgIndicator[]>(`/esg-indicator/dimension/${dimension}`);
}

export function getIndicatorById(id: number) {
  return get<EsgIndicator>(`/esg-indicator/${id}`);
}

export function saveIndicator(data: EsgIndicator) {
  return post<boolean>('/esg-indicator', data);
}

export function updateIndicator(data: EsgIndicator) {
  return put<boolean>('/esg-indicator', data);
}

export function deleteIndicator(id: number) {
  return del<boolean>(`/esg-indicator/${id}`);
}

export function getIndicatorDataPage(params: {
  orgId?: number;
  indicatorId?: number;
  periodType?: number;
  periodValue?: string;
  pageNum?: number;
  pageSize?: number;
}) {
  return get<PageResult<EsgIndicatorData>>('/esg-indicator/data/page', params as Record<string, unknown>);
}

export function saveIndicatorData(data: EsgIndicatorData) {
  return post<boolean>('/esg-indicator/data', data);
}

export function updateIndicatorData(data: EsgIndicatorData) {
  return put<boolean>('/esg-indicator/data', data);
}

export function deleteIndicatorData(id: number) {
  return del<boolean>(`/esg-indicator/data/${id}`);
}
