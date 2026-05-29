import { get, post, put, del } from './request';
import type { Report, PageResult } from '@/types';

export function generateReport(params: {
  orgId: number;
  reportType: number;
  periodType: number;
  periodValue: string;
  createBy: string;
}) {
  return post<Report>('/report/generate', undefined, params as Record<string, unknown>);
}

export function getReportPage(params: {
  orgId?: number;
  reportType?: number;
  reportStatus?: number;
  pageNum?: number;
  pageSize?: number;
}) {
  return get<PageResult<Report>>('/report/page', params as Record<string, unknown>);
}

export function getReportById(id: number) {
  return get<Report>(`/report/${id}`);
}

export function createNewVersion(reportId: number, createBy: string) {
  return post<Report>('/report/new-version', undefined, { reportId, createBy });
}

export function getReportHistory(reportNo: string) {
  return get<Report[]>(`/report/history/${reportNo}`);
}

export function updateReport(data: Report) {
  return put<boolean>('/report', data);
}

export function deleteReport(id: number) {
  return del<boolean>(`/report/${id}`);
}
