import request from '@/utils/request'
import type { ApiResponse, PaginationResponse, User } from '@/types'

export const getUsers = (params?: any): Promise<ApiResponse<PaginationResponse<User>>> => {
  return request.get('/users', { params }).then(res => res.data)
}

export const getUser = (id: number): Promise<ApiResponse<User>> => {
  return request.get(`/users/${id}`).then(res => res.data)
}

export const createUser = (data: any): Promise<ApiResponse<User>> => {
  return request.post('/users', data).then(res => res.data)
}

export const updateUser = (id: number, data: any): Promise<ApiResponse<User>> => {
  return request.put(`/users/${id}`, data).then(res => res.data)
}

export const deleteUser = (id: number): Promise<ApiResponse> => {
  return request.delete(`/users/${id}`).then(res => res.data)
}
