import request from '@/utils/request'
import type { ApiResponse, PaginationResponse, InspectionReport } from '@/types'

export const getReports = (params?: any): Promise<ApiResponse<PaginationResponse<InspectionReport>>> => {
  return request.get('/reports', { params }).then(res => res.data)
}

export const getReport = (id: number): Promise<ApiResponse<InspectionReport>> => {
  return request.get(`/reports/${id}`).then(res => res.data)
}

export const createReport = (data: any): Promise<ApiResponse<InspectionReport>> => {
  return request.post('/reports', data).then(res => res.data)
}

export const generateTaskReport = (taskId: number): Promise<ApiResponse<InspectionReport>> => {
  return request.post(`/reports/task/${taskId}`).then(res => res.data)
}

export const generateStoreReport = (storeId: number, params?: any): Promise<ApiResponse<InspectionReport>> => {
  return request.post(`/reports/store/${storeId}`, null, { params }).then(res => res.data)
}

export const generateSummaryReport = (params?: any): Promise<ApiResponse<InspectionReport>> => {
  return request.post('/reports/summary', null, { params }).then(res => res.data)
}
