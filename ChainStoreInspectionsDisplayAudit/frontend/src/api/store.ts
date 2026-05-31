import request from '@/utils/request'
import type { ApiResponse, PaginationResponse, Store } from '@/types'

export const getStores = (params?: any): Promise<ApiResponse<PaginationResponse<Store>>> => {
  return request.get('/stores', { params }).then(res => res.data)
}

export const getStore = (id: number): Promise<ApiResponse<Store>> => {
  return request.get(`/stores/${id}`).then(res => res.data)
}

export const createStore = (data: any): Promise<ApiResponse<Store>> => {
  return request.post('/stores', data).then(res => res.data)
}

export const updateStore = (id: number, data: any): Promise<ApiResponse<Store>> => {
  return request.put(`/stores/${id}`, data).then(res => res.data)
}

export const deleteStore = (id: number): Promise<ApiResponse> => {
  return request.delete(`/stores/${id}`).then(res => res.data)
}
