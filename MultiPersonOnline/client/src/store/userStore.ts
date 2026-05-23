import { create } from 'zustand'
import type { User, LoginRequest, LoginResponse, RegisterRequest } from '@/types'
import { authApi } from '@/api/auth'
import { storage } from '@/utils/storage'

interface UserState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean

  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  fetchProfile: () => Promise<void>
  updateProfile: (data: Partial<Pick<User, 'nickname' | 'email' | 'avatarUrl'>>) => Promise<void>
  setUser: (user: User | null) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: storage.getUser<User>(),
  token: storage.getToken(),
  isAuthenticated: !!storage.getToken(),
  loading: false,

  login: async (data: LoginRequest) => {
    set({ loading: true })
    try {
      const res = await authApi.login(data) as unknown as LoginResponse
      const token = res.accessToken
      const user = res.user
      if (!token) {
        throw new Error('登录失败：未获取到 token')
      }
      storage.setToken(token)
      storage.setUser(user)
      set({ user, token, isAuthenticated: true })
    } finally {
      set({ loading: false })
    }
  },

  register: async (data: RegisterRequest) => {
    set({ loading: true })
    try {
      await authApi.register(data)
    } finally {
      set({ loading: false })
    }
  },

  logout: () => {
    storage.clear()
    set({ user: null, token: null, isAuthenticated: false })
  },

  fetchProfile: async () => {
    set({ loading: true })
    try {
      const user = await authApi.getProfile() as unknown as User
      storage.setUser(user)
      set({ user })
    } finally {
      set({ loading: false })
    }
  },

  updateProfile: async (data) => {
    set({ loading: true })
    try {
      const user = await authApi.updateProfile(data) as unknown as User
      storage.setUser(user)
      set({ user })
    } finally {
      set({ loading: false })
    }
  },

  setUser: (user) => {
    if (user) {
      storage.setUser(user)
    } else {
      storage.removeUser()
    }
    set({ user })
  },
}))
