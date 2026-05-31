import { storage } from './storage'
import type { User } from '@/types/models'
import type { LoginRequest, LoginResponse, ApiResponse } from '@/types/api'
import request from './request'
import router from '@/router'

export const LOGIN_ROUTE = '/login'
export const HOME_ROUTE = '/'

export const auth = {
  login: async (params: LoginRequest): Promise<LoginResponse> => {
    const response = await request.post<ApiResponse<LoginResponse>>('/auth/login', params)
    const { token, user } = response.data.data
    storage.setToken(token)
    storage.setUser(user)
    return response.data.data
  },

  logout: (redirect: boolean = true): void => {
    storage.clear()
    if (redirect) {
      router.push(LOGIN_ROUTE)
    }
  },

  getCurrentUser: (): User | null => {
    return storage.getUser()
  },

  isLoggedIn: (): boolean => {
    const token = storage.getToken()
    const user = storage.getUser()
    return !!token && !!user
  },

  getToken: (): string | null => {
    return storage.getToken()
  },

  checkAuth: (): boolean => {
    if (!auth.isLoggedIn()) {
      router.push(LOGIN_ROUTE)
      return false
    }
    return true
  },

  hasRole: (roles: string | string[]): boolean => {
    const user = auth.getCurrentUser()
    if (!user) return false
    if (Array.isArray(roles)) {
      return roles.includes(user.role)
    }
    return user.role === roles
  },

  isAdmin: (): boolean => {
    return auth.hasRole('admin')
  },

  isManager: (): boolean => {
    return auth.hasRole(['admin', 'manager'])
  },

  isInspector: (): boolean => {
    return auth.hasRole(['admin', 'manager', 'inspector'])
  },

  redirectToLogin: (): void => {
    const currentPath = router.currentRoute.value.fullPath
    if (currentPath !== LOGIN_ROUTE) {
      router.push({
        path: LOGIN_ROUTE,
        query: { redirect: currentPath }
      })
    }
  },

  redirectAfterLogin: (): void => {
    const query = router.currentRoute.value.query
    const redirect = query.redirect as string
    if (redirect && redirect !== LOGIN_ROUTE) {
      router.push(redirect)
    } else {
      router.push(HOME_ROUTE)
    }
  }
}

export default auth
