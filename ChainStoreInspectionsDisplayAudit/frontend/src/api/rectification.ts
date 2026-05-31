import request from '@/utils/request'
import type { ApiResponse, PaginationResponse, Rectification } from '@/types'

export const getRectifications = (params?: any): Promise<ApiResponse<PaginationResponse<Rectification>>> => {
  return request.get('/rectifications', { params }).then(res => res.data)
}

export const getRectification = (id: number): Promise<ApiResponse<Rectification>> => {
  return request.get(`/rectifications/${id}`).then(res => res.data)
}

export const createRectification = (data: any): Promise<ApiResponse<Rectification>> => {
  return request.post('/rectifications', data).then(res => res.data)
}

export const updateRectification = (id: number, data: any): Promise<ApiResponse<Rectification>> => {
  return request.put(`/rectifications/${id}`, data).then(res => res.data)
}

export const submitRectification = (id: number, data: any): Promise<ApiResponse<Rectification>> => {
  return request.post(`/rectifications/${id}/submit`, data).then(res => res.data)
}

export const recheckRectification = (id: number, data: any): Promise<ApiResponse<Rectification>> => {
  return request.post(`/rectifications/${id}/recheck`, data).then(res => res.data)
}
