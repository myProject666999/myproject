import request from '@/utils/request'
import type { ApiResponse, PaginationResponse, ChecklistTemplate, ChecklistItem } from '@/types'

export const getTemplates = (params?: any): Promise<ApiResponse<PaginationResponse<ChecklistTemplate>>> => {
  return request.get('/templates', { params }).then(res => res.data)
}

export const getTemplate = (id: number): Promise<ApiResponse<ChecklistTemplate>> => {
  return request.get(`/templates/${id}`).then(res => res.data)
}

export const createTemplate = (data: any): Promise<ApiResponse<ChecklistTemplate>> => {
  return request.post('/templates', data).then(res => res.data)
}

export const updateTemplate = (id: number, data: any): Promise<ApiResponse<ChecklistTemplate>> => {
  return request.put(`/templates/${id}`, data).then(res => res.data)
}

export const deleteTemplate = (id: number): Promise<ApiResponse> => {
  return request.delete(`/templates/${id}`).then(res => res.data)
}

export const getTemplateItems = (templateId: number): Promise<ApiResponse<ChecklistItem[]>> => {
  return request.get(`/templates/${templateId}/items`).then(res => res.data)
}

export const createItem = (data: any): Promise<ApiResponse<ChecklistItem>> => {
  return request.post('/templates/items', data).then(res => res.data)
}

export const updateItem = (id: number, data: any): Promise<ApiResponse<ChecklistItem>> => {
  return request.put(`/templates/items/${id}`, data).then(res => res.data)
}

export const deleteItem = (id: number): Promise<ApiResponse> => {
  return request.delete(`/templates/items/${id}`).then(res => res.data)
}
