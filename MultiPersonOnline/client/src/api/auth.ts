import request from './request'
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types'

export const authApi = {
  login(data: LoginRequest) {
    return request.post<LoginResponse>('/auth/login', data)
  },

  register(data: RegisterRequest) {
    return request.post<{ message: string; user: User }>('/auth/register', data)
  },

  getProfile() {
    return request.get<User>('/auth/profile')
  },

  updateProfile(data: Partial<Pick<User, 'nickname' | 'email' | 'avatarUrl'>>) {
    return request.put<User>('/auth/profile', data)
  },

  changePassword(data: { oldPassword: string; newPassword: string }) {
    return request.put('/auth/password', data)
  },
}
