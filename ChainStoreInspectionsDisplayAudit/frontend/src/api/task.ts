import request from '@/utils/request'
import type { ApiResponse, PaginationResponse, InspectionTask } from '@/types'

export const getTasks = (params?: any): Promise<ApiResponse<PaginationResponse<InspectionTask>>> => {
  return request.get('/tasks', { params }).then(res => res.data)
}

export const getTask = (id: number): Promise<ApiResponse<InspectionTask>> => {
  return request.get(`/tasks/${id}`).then(res => res.data)
}

export const createTask = (data: any): Promise<ApiResponse<InspectionTask>> => {
  return request.post('/tasks', data).then(res => res.data)
}

export const updateTask = (id: number, data: any): Promise<ApiResponse<InspectionTask>> => {
  return request.put(`/tasks/${id}`, data).then(res => res.data)
}

export const deleteTask = (id: number): Promise<ApiResponse> => {
  return request.delete(`/tasks/${id}`).then(res => res.data)
}

export const startTask = (id: number): Promise<ApiResponse<InspectionTask>> => {
  return request.post(`/tasks/${id}/start`).then(res => res.data)
}

export const completeTask = (id: number): Promise<ApiResponse<InspectionTask>> => {
  return request.post(`/tasks/${id}/complete`).then(res => res.data)
}
