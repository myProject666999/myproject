import type { User } from './models'

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface LoginRequest {
  username: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  token: string
  user: User
  expiresIn?: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}
