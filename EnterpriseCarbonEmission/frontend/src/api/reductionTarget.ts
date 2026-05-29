import { get, post, put, del } from './request';
import type { ReductionTarget, PageResult } from '@/types';

export function getReductionTargetPage(params: {
  orgId?: number;
  status?: number;
  pageNum?: number;
  pageSize?: number;
}) {
  return get<PageResult<ReductionTarget>>('/reduction-target/page', params as Record<string, unknown>);
}

export function getTargetsByOrg(orgId: number) {
  return get<ReductionTarget[]>(`/reduction-target/org/${orgId}`);
}

export function getReductionTargetById(id: number) {
  return get<ReductionTarget>(`/reduction-target/${id}`);
}

export function saveReductionTarget(data: ReductionTarget) {
  return post<boolean>('/reduction-target', data);
}

export function updateReductionTarget(data: ReductionTarget) {
  return put<boolean>('/reduction-target', data);
}

export function deleteReductionTarget(id: number) {
  return del<boolean>(`/reduction-target/${id}`);
}

export function updateTargetProgress(targetId: number, actualEmission: number) {
  return post<ReductionTarget>('/reduction-target/update-progress', undefined, { targetId, actualEmission });
}
