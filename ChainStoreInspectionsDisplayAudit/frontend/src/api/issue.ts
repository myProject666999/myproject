import request from '@/utils/request'
import type { ApiResponse, PaginationResponse, Issue } from '@/types'

export const getIssues = (params?: any): Promise<ApiResponse<PaginationResponse<Issue>>> => {
  return request.get('/issues', { params }).then(res => res.data)
}

export const getIssue = (id: number): Promise<ApiResponse<Issue>> => {
  return request.get(`/issues/${id}`).then(res => res.data)
}

export const createIssue = (data: any): Promise<ApiResponse<Issue>> => {
  return request.post('/issues', data).then(res => res.data)
}

export const updateIssue = (id: number, data: any): Promise<ApiResponse<Issue>> => {
  return request.put(`/issues/${id}`, data).then(res => res.data)
}

export const deleteIssue = (id: number): Promise<ApiResponse> => {
  return request.delete(`/issues/${id}`).then(res => res.data)
}

export const assignIssue = (id: number, data: any): Promise<ApiResponse<Issue>> => {
  return request.post(`/issues/${id}/assign`, data).then(res => res.data)
}
