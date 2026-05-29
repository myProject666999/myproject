import { get, post, put, del, upload } from './request';
import type { EmissionData, PageResult, ImportBatch } from '@/types';

export function getEmissionDataPage(params: {
  orgId?: number;
  emissionScope?: number;
  sourceType?: number;
  activityMonth?: string;
  pageNum?: number;
  pageSize?: number;
}) {
  return get<PageResult<EmissionData>>('/emission-data/page', params as Record<string, unknown>);
}

export function getEmissionDataById(id: number) {
  return get<EmissionData>(`/emission-data/${id}`);
}

export function saveEmissionData(data: EmissionData) {
  return post<boolean>('/emission-data', data);
}

export function updateEmissionData(data: EmissionData) {
  return put<boolean>('/emission-data', data);
}

export function deleteEmissionData(id: number) {
  return del<boolean>(`/emission-data/${id}`);
}

export function batchImportEmissionData(file: File, orgId: number, createBy: string) {
  const formData = new FormData();
  formData.append('file', file);
  return upload<ImportBatch>('/emission-data/import', formData, { orgId, createBy });
}
