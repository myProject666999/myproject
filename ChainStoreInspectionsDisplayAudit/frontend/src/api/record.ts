import request from '@/utils/request'
import type { ApiResponse, PaginationResponse, InspectionRecord } from '@/types'

export const getRecords = (params?: any): Promise<ApiResponse<PaginationResponse<InspectionRecord>>> => {
  return request.get('/records', { params }).then(res => res.data)
}

export const getRecord = (id: number): Promise<ApiResponse<InspectionRecord>> => {
  return request.get(`/records/${id}`).then(res => res.data)
}

export const createRecord = (data: any): Promise<ApiResponse<InspectionRecord>> => {
  return request.post('/records', data).then(res => res.data)
}

export const updateRecord = (id: number, data: any): Promise<ApiResponse<InspectionRecord>> => {
  return request.put(`/records/${id}`, data).then(res => res.data)
}

export const deleteRecord = (id: number): Promise<ApiResponse> => {
  return request.delete(`/records/${id}`).then(res => res.data)
}
