import request from '@/utils/request'
import type { ApiResponse, PaginationResponse, LoginRequest, LoginResponse, User } from '@/types'

export const login = (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  return request.post('/auth/login', data).then(res => res.data)
}

export const logout = (): Promise<ApiResponse> => {
  return request.post('/auth/logout').then(res => res.data)
}

export const getUserInfo = (): Promise<ApiResponse<User>> => {
  return request.get('/auth/user-info').then(res => res.data)
}

export const getUsers = (params?: any): Promise<ApiResponse<PaginationResponse<User>>> => {
  return request.get('/users', { params }).then(res => res.data)
}
