import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RouteConfig } from '@/types'

interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
  roles: string[]
  permissions: string[]
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>(localStorage.getItem('token') || '')
  const routes = ref<RouteConfig[]>([])
  const permissions = ref<string[]>([])
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.roles?.includes('admin') || false)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
    permissions.value = info.permissions || []
  }

  function setRoutes(newRoutes: RouteConfig[]) {
    routes.value = newRoutes
  }

  async function login(username: string, password: string) {
    loading.value = true
    try {
      const mockToken = 'mock-jwt-token-' + Date.now()
      setToken(mockToken)
      
      const mockUser: UserInfo = {
        id: 1,
        username,
        nickname: '管理员',
        avatar: '',
        email: 'admin@example.com',
        phone: '13800138000',
        roles: ['admin'],
        permissions: ['*']
      }
      setUserInfo(mockUser)
      
      return { success: true }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    token.value = ''
    userInfo.value = null
    routes.value = []
    permissions.value = []
    localStorage.removeItem('token')
  }

  function hasPermission(permission: string): boolean {
    if (!permission) return true
    if (permissions.value.includes('*')) return true
    return permissions.value.includes(permission)
  }

  function hasAnyPermission(perms: string[]): boolean {
    if (!perms || perms.length === 0) return true
    return perms.some(p => hasPermission(p))
  }

  function hasRole(role: string): boolean {
    if (!role) return true
    return userInfo.value?.roles?.includes(role) || false
  }

  function reset() {
    token.value = ''
    userInfo.value = null
    routes.value = []
    permissions.value = []
    localStorage.removeItem('token')
  }

  return {
    userInfo,
    token,
    routes,
    permissions,
    loading,
    isLoggedIn,
    isAdmin,
    setToken,
    setUserInfo,
    setRoutes,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasRole,
    reset
  }
})
